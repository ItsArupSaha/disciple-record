"use server";

import { adminDb } from "../lib/firebase/admin";
import { normalizeNumbers } from "../lib/utils";

// Basic auth check utility
async function isSuperAdmin(email: string) {
  const superAdminEmails = process.env.SUPERADMIN_EMAILS?.split(',') || [];
  return superAdminEmails.includes(email);
}

async function isAdmin(email: string) {
  const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
  return adminEmails.includes(email) || await isSuperAdmin(email);
}

export async function getAllUsers(email: string) {
  if (!await isAdmin(email)) return { success: false, error: "Unauthorized" };

  try {
    const snapshot = await adminDb.collection("users").get();
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return { success: true, data: users };
  } catch (error) {
    return { success: false, error: "Failed to fetch users" };
  }
}

export async function approveUser(uid: string, email: string) {
  if (!await isAdmin(email)) return { success: false, error: "Unauthorized" };

  try {
    await adminDb.collection("users").doc(uid).update({
      isApproved: true,
      role: "USER"
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: "Approval failed" };
  }
}

export async function deleteUser(uid: string, passwordInput: string, email: string) {
  if (!await isSuperAdmin(email)) return { success: false, error: "Unauthorized" };
  
  const expectedPassword = process.env.ADMIN_ACTION_PASSWORD_HASH;
  if (passwordInput !== expectedPassword) {
    return { success: false, error: "Incorrect Password" };
  }

  try {
    await adminDb.collection("users").doc(uid).delete();
    return { success: true };
  } catch (error) {
    return { success: false, error: "Deletion failed" };
  }
}

export async function findMatchingRecord(initiatedName: string, email: string) {
  if (!await isAdmin(email)) return { success: false, error: "Unauthorized" };
  
  try {
    // Search for existing users with the same initiatedName
    // Because Firebase string equality is case-sensitive, we'll do an exact match check.
    const snapshot = await adminDb.collection("users")
      .where("initiatedName", "==", initiatedName)
      .get();
      
    // Filter out the ones that are already connected to an actual Google UID 
    // Wait, the new user already created a document with their UID.
    // So we need to find OTHER documents with same initiatedName.
    const matches = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return { success: true, data: matches };
  } catch (error) {
    return { success: false, error: "Failed to search matches" };
  }
}

export async function mergeUser(sourceUid: string, targetDocId: string, email: string, keepTargetMobile: boolean) {
  if (!await isAdmin(email)) return { success: false, error: "Unauthorized" };

  try {
    const sourceDoc = await adminDb.collection("users").doc(sourceUid).get();
    const targetDoc = await adminDb.collection("users").doc(targetDocId).get();

    if (!sourceDoc.exists || !targetDoc.exists) return { success: false, error: "Missing records" };

    const sourceData: any = sourceDoc.data();
    const targetData: any = targetDoc.data();

    // The target doc is the "offline" or already existing manually inputted record.
    // We want to keep the offline record's core data, but update it with the new Auth UID and email.
    // And possibly keep the mobile number from the source data if the admin chose to.
    
    // Step 1: Update targetDoc with Google Auth info
    await adminDb.collection("users").doc(targetDocId).update({
      uid: sourceUid, // Now this old record is linked to the new Google Auth UID
      email: sourceData.email,
      isApproved: true,
      role: "USER",
      // optionally overwrite fields 
      mobileNumber: keepTargetMobile ? targetData.mobileNumber : sourceData.mobileNumber,
    });

    // Step 2: Delete the temporary profile created during onboarding
    await adminDb.collection("users").doc(sourceUid).delete();

    // Wait, now the user's Google UID doesn't match the firestore doc ID!
    // Firebase Auth UID is `sourceUid`. 
    // The previously offline doc has ID `targetDocId`.
    // Next time they login, `fetchProfile(currentUser.uid)` will look for `users/sourceUid`. But we just deleted it!
    // Ah! We must retain the doc ID as `sourceUid`!
    // So we should move targetData into `users/sourceUid` instead.

    // Let's do that: Move offline data into the Auth-linked document.
    const mergedData = {
       ...targetData, // Take all existing offline data
       ...sourceData, // Overwrite with new info (which gives us the actual email and uid)
       isApproved: true,
       role: "USER",
       // if we want to keep the offline mobile number:
       mobileNumber: keepTargetMobile ? targetData.mobileNumber : sourceData.mobileNumber,
    };

    // Update the Auth document
    await adminDb.collection("users").doc(sourceUid).set(mergedData);

    // Delete the old offline document
    await adminDb.collection("users").doc(targetDocId).delete();

    return { success: true };
  } catch (error) {
    console.error("Merge error", error);
    return { success: false, error: "Merge failed" };
  }
}

export async function importDisciplesAction(disciples: any[], email: string) {
  if (!await isAdmin(email)) return { success: false, error: "Unauthorized" };

  try {
    // 1. Get all existing users to check duplicates
    const snapshot = await adminDb.collection("users").get();
    const existingUsers = snapshot.docs.map(doc => doc.data());

    // Normalization helper
    const normalizeString = (str: any) => {
      if (!str) return "";
      return String(str).trim().toLowerCase().replace(/[\s-]/g, "");
    };

    // Create sets of existing identifiers for instant lookup
    const existingMobiles = new Set(
      existingUsers
        .map(u => normalizeString(u.mobileNumber))
        .filter(m => m !== "")
    );
    const existingInitiatedNames = new Set(
      existingUsers
        .map(u => normalizeString(u.initiatedName))
        .filter(n => n !== "")
    );
    const existingNames = new Set(
      existingUsers
        .map(u => normalizeString(u.name))
        .filter(n => n !== "")
    );

    const batch = adminDb.batch();
    let importCount = 0;
    let duplicateCount = 0;

    disciples.forEach((d) => {
      // Map Bengali and English keys
      const serialNo = d['Serial No.'] ?? d['serialNo'] ?? d['Serial'] ?? "";
      const oldSerialNo = d['পুরাতন সিরিয়েল নং'] ?? d['oldSerialNo'] ?? "";
      const name = (d['নাম'] ?? d['Name'] ?? d['name'] ?? "").toString().trim();
      const presentAddress = (d['ঠিকানা'] ?? d['Present Address'] ?? d['Address'] ?? d['address'] ?? "").toString().trim();
      const permanentAddress = (d['স্থায়ী ঠিকানা'] ?? d['Permanent Address'] ?? d['permanentAddress'] ?? "").toString().trim();
      const dob = (d['জন্ম তারিখ'] ?? d['Date of Birth'] ?? d['dob'] ?? "").toString().trim();
      const occupation = (d['পেশা'] ?? d['Profession'] ?? d['Occupation'] ?? d['occupation'] ?? "").toString().trim();
      
      const mobileNumber = normalizeNumbers((d['মোবাইল নম্বর'] ?? d['Mobile Number'] ?? d['mobileNumber'] ?? d['mobile'] ?? "").toString().trim());
      const whatsappNumber = normalizeNumbers((d['WhatsApp নম্বর'] ?? d['WhatsApp Number'] ?? d['whatsappNumber'] ?? d['whatsapp'] ?? "").toString().trim());
      
      const bloodGroup = (d['রক্তের গ্রুপ'] ?? d['Blood Group'] ?? d['bloodGroup'] ?? "").toString().trim();
      const joinedIskconDate = normalizeNumbers((d['ইস্‌কনে যুক্ত হওয়ার তারিখ'] ?? d['Joined ISKCON Date'] ?? d['joinedIskconDate'] ?? "").toString().trim());
      const initiatedName = (d['দীক্ষানাম'] ?? d['Initiated Name'] ?? d['initiatedName'] ?? "").toString().trim();
      
      const harinamInitiationVal = d[' হরিনাম দীক্ষা'] ?? d['হরিনাম দীক্ষা'] ?? d['Harinama Initiation'] ?? d['harinamInitiation'] ?? "";
      const harinamInitiation = typeof harinamInitiationVal === "boolean" ? (harinamInitiationVal ? "Yes" : "No") : harinamInitiationVal.toString().trim();

      const initiatedYear = normalizeNumbers((d['দীক্ষা তারিখ ও সাল'] ?? d['Initiated Year'] ?? d['initiatedYear'] ?? "").toString().trim());
      const initiationPlace = (d['স্থান'] ?? d['Initiation Place'] ?? d['initiationPlace'] ?? "").toString().trim();
      
      const brahmanInitiationVal = d['ব্রাহ্মন দীক্ষা'] ?? d['Brahman Initiation'] ?? d['brahmanInitiation'] ?? "";
      const brahmanInitiation = typeof brahmanInitiationVal === "boolean" ? (brahmanInitiationVal ? "Yes" : "No") : brahmanInitiationVal.toString().trim();
      
      const brahmanInitiationDate = normalizeNumbers((d['ব্রাহ্মন দীক্ষার তারিখ ও সাল'] ?? d['Brahman Initiation Date'] ?? d['brahmanInitiationDate'] ?? "").toString().trim());
      const brahmanInitiationPlace = (d['স্খান'] ?? d['Brahman Initiation Place'] ?? d['brahmanInitiationPlace'] ?? "").toString().trim();
      const department = (d['কোন বিভাগের সাথে যুক্ত'] ?? d['Department'] ?? d['department'] ?? "").toString().trim();
      const service = (d['সেবা'] ?? d['Service'] ?? d['service'] ?? "").toString().trim();
      const counselorName = (d['কাউন্সিলর বা শিক্ষাগুরুর নাম'] ?? d['Counselor Name'] ?? d['counselorName'] ?? "").toString().trim();
      
      const gender = (d['Gender'] ?? d['gender'] ?? "").toString().trim();
      const maritalStatus = (d['Marital Status'] ?? d['maritalStatus'] ?? "").toString().trim();
      const sadhanaGrantha = (d['সাধনা গ্রন্থ'] ?? d['সাধনা গন্থ্য'] ?? d['Sadhana Grantha'] ?? d['sadhanaGrantha'] ?? "").toString().trim();
      const shelteredDate = normalizeNumbers((d['আশ্রিত তারিখ ও সাল'] ?? d['Shelter Date'] ?? d['shelteredDate'] ?? "").toString().trim());
      const namahattaName = (d['নামহট্টের নাম'] ?? d['Namahatta Name'] ?? d['namahattaName'] ?? "").toString().trim();
      
      const isNamahattaConnectedVal = d['নামহট্টের সাথে যুক্ত?'] ?? d['Is Namahatta Connected'] ?? d['isNamahattaConnected'] ?? "";
      const isNamahattaConnected = typeof isNamahattaConnectedVal === "boolean" ? (isNamahattaConnectedVal ? "Yes" : "No") : isNamahattaConnectedVal.toString().trim();

      // Duplicate Check
      const normMobile = normalizeString(mobileNumber);
      const normInitiatedName = normalizeString(initiatedName);
      const normName = normalizeString(name);

      let isDuplicate = false;
      if (normMobile && existingMobiles.has(normMobile)) {
        isDuplicate = true;
      } else if (normInitiatedName && existingInitiatedNames.has(normInitiatedName)) {
        isDuplicate = true;
      } else if (!normInitiatedName && normName && normMobile && existingNames.has(normName) && existingMobiles.has(normMobile)) {
        isDuplicate = true;
      }

      if (isDuplicate) {
        duplicateCount++;
        return;
      }

      const docRef = adminDb.collection("users").doc();
      const userData = {
        uid: "",
        email: "",
        role: "USER" as const,
        isApproved: true,
        
        serialNo,
        oldSerialNo,
        name,
        presentAddress,
        permanentAddress,
        dob,
        occupation,
        mobileNumber,
        whatsappNumber,
        bloodGroup,
        joinedIskconDate,
        initiatedName,
        harinamInitiation,
        initiatedYear,
        initiationPlace,
        brahmanInitiation,
        brahmanInitiationDate,
        brahmanInitiationPlace,
        department,
        service,
        counselorName,
        gender,
        maritalStatus,
        sadhanaGrantha,
        shelteredDate,
        namahattaName,
        isNamahattaConnected,
        
        createdAt: new Date().toISOString(),
      };
      
      batch.set(docRef, userData);
      importCount++;

      // Prevent duplicate imports in the same uploaded sheet
      if (normMobile) existingMobiles.add(normMobile);
      if (normInitiatedName) existingInitiatedNames.add(normInitiatedName);
      if (normName) existingNames.add(normName);
    });

    if (importCount > 0) {
      await batch.commit();
    }
    return { success: true, count: importCount, duplicates: duplicateCount };
  } catch (error) {
    console.error("Batch import error", error);
    return { success: false, error: "Batch import failed" };
  }
}

export async function updateUserAction(uid: string, updatedData: any, passwordInput: string, adminEmail: string) {
  if (!await isSuperAdmin(adminEmail)) return { success: false, error: "Unauthorized" };

  const expectedPassword = process.env.ADMIN_ACTION_PASSWORD_HASH;
  if (passwordInput !== expectedPassword) {
    return { success: false, error: "Incorrect Password" };
  }

  try {
    const dataToUpdate = {
      ...updatedData,
      mobileNumber: normalizeNumbers(updatedData.mobileNumber || ""),
      whatsappNumber: normalizeNumbers(updatedData.whatsappNumber || ""),
      joinedIskconDate: normalizeNumbers(updatedData.joinedIskconDate || ""),
      initiatedYear: normalizeNumbers(updatedData.initiatedYear || ""),
      brahmanInitiationDate: normalizeNumbers(updatedData.brahmanInitiationDate || ""),
      shelteredDate: normalizeNumbers(updatedData.shelteredDate || ""),
      updatedAt: new Date().toISOString(),
    };
    
    await adminDb.collection("users").doc(uid).update(dataToUpdate);
    return { success: true };
  } catch (error) {
    console.error("Update user error", error);
    return { success: false, error: "Update failed" };
  }
}
