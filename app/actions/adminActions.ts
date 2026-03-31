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
  if (!await isSuperAdmin(email)) return { success: false, error: "Unauthorized" };

  try {
    const batch = adminDb.batch();
    
    disciples.forEach((d) => {
      const docRef = adminDb.collection("users").doc();
      const userData = {
        name: d.Name || d.name || "",
        initiatedName: d["Initiated Name"] || d.initiatedName || "",
        mobileNumber: normalizeNumbers(d["Mobile Number"] || d.mobileNumber),
        whatsappNumber: normalizeNumbers(d["WhatsApp Number"] || d.whatsappNumber),
        bloodGroup: d["Blood Group"] || d.bloodGroup || "",
        joinedIskconDate: normalizeNumbers(d["Joined ISKCON Date"] || d.joinedIskconDate),
        initiatedYear: normalizeNumbers(d["Initiated Year"] || d.initiatedYear),
        spiritualMaster: d["Spiritual Master"] || d.spiritualMaster || "HH Jayapataka Swami",
        address: {
          division: d.Division || d.division || "",
          district: d.District || d.district || "",
          thana: d.Thana || d.thana || ""
        },
        isApproved: true,
        role: "USER" as const,
        createdAt: new Date().toISOString(),
      };
      batch.set(docRef, userData);
    });

    await batch.commit();
    return { success: true };
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
      mobileNumber: normalizeNumbers(updatedData.mobileNumber),
      whatsappNumber: normalizeNumbers(updatedData.whatsappNumber),
      joinedIskconDate: normalizeNumbers(updatedData.joinedIskconDate),
      initiatedYear: normalizeNumbers(updatedData.initiatedYear),
      updatedAt: new Date().toISOString(),
    };
    
    await adminDb.collection("users").doc(uid).update(dataToUpdate);
    return { success: true };
  } catch (error) {
    console.error("Update user error", error);
    return { success: false, error: "Update failed" };
  }
}
