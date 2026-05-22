"use server";

import { adminDb } from "../lib/firebase/admin";
import { UserProfile } from "../context/AuthContext";
import { normalizeNumbers } from "../lib/utils";

export async function submitOnboarding(data: Partial<UserProfile>, uid: string, email: string | null) {
  try {
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
    const superAdminEmails = process.env.SUPERADMIN_EMAILS?.split(',') || [];

    let role: UserProfile['role'] = "PENDING";
    let isApproved = false;

    if (email) {
      if (superAdminEmails.includes(email)) {
        role = "SUPER_ADMIN";
        isApproved = true;
      } else if (adminEmails.includes(email)) {
        role = "ADMIN";
        isApproved = true;
      }
    }

    const userData: UserProfile = {
      uid,
      email,
      role,
      isApproved,
      
      serialNo: data.serialNo || "",
      oldSerialNo: data.oldSerialNo || "",
      name: data.name || "",
      presentAddress: data.presentAddress || "",
      permanentAddress: data.permanentAddress || "",
      dob: data.dob || "",
      occupation: data.occupation || "",
      mobileNumber: normalizeNumbers(data.mobileNumber || ""),
      whatsappNumber: normalizeNumbers(data.whatsappNumber || ""),
      bloodGroup: data.bloodGroup || "",
      joinedIskconDate: normalizeNumbers(data.joinedIskconDate || ""),
      initiatedName: data.initiatedName || "",
      harinamInitiation: data.harinamInitiation || "",
      initiatedYear: normalizeNumbers(data.initiatedYear || ""),
      initiationPlace: data.initiationPlace || "",
      brahmanInitiation: data.brahmanInitiation || "",
      brahmanInitiationDate: normalizeNumbers(data.brahmanInitiationDate || ""),
      brahmanInitiationPlace: data.brahmanInitiationPlace || "",
      department: data.department || "",
      service: data.service || "",
      counselorName: data.counselorName || "",
      gender: data.gender || "",
      maritalStatus: data.maritalStatus || "",
      sadhanaGrantha: data.sadhanaGrantha || "",
      shelteredDate: normalizeNumbers(data.shelteredDate || ""),
      namahattaName: data.namahattaName || "",
      isNamahattaConnected: data.isNamahattaConnected || "",
      profileImageURL: data.profileImageURL || "",
    };

    // Save strictly to Firestore using Admin SDK
    await adminDb.collection("users").doc(uid).set({
      ...userData,
      createdAt: new Date().toISOString(),
    });

    return { success: true, role, isApproved };
  } catch (error) {
    console.error("Error submitting onboarding", error);
    return { success: false, error: "Failed to submit data" };
  }
}

export async function checkAndCreateAdminUser(uid: string, email: string | null, name: string | null) {
  if (!email) return { success: false, isCreated: false };

  const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
  const superAdminEmails = process.env.SUPERADMIN_EMAILS?.split(',') || [];

  let role: UserProfile['role'] | null = null;
  if (superAdminEmails.includes(email)) role = "SUPER_ADMIN";
  else if (adminEmails.includes(email)) role = "ADMIN";

  if (!role) return { success: true, isCreated: false };

  try {
    const docRef = adminDb.collection("users").doc(uid);
    const docSnap = await docRef.get();
    
    if (!docSnap.exists) {
      await docRef.set({
        uid,
        email,
        name: name || "Admin",
        role,
        isApproved: true,
        createdAt: new Date().toISOString(),
      });
      return { success: true, isCreated: true, role };
    }
  } catch (error) {
    console.error("Admin silent creation error", error);
    return { success: false, error: "Failed to create admin" };
  }
  
  return { success: true, isCreated: false };
}

export async function findOfflineProfile(initiatedName: string, mobileNumber: string) {
  try {
    const cleanMobile = mobileNumber.replace(/[\s-]/g, "").trim();
    const cleanInitiated = initiatedName.toLowerCase().replace(/[\s-]/g, "").trim();
    
    if (!cleanMobile && !cleanInitiated) {
      return { success: false, error: "Please enter Initiated Name or Mobile Number" };
    }
    
    const snapshot = await adminDb.collection("users")
      .where("uid", "==", "")
      .get();
      
    const candidates = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
    
    const matched = candidates.filter(c => {
      const dbMobile = (c.mobileNumber || "").replace(/[\s-]/g, "").trim();
      const dbInitiated = (c.initiatedName || "").toLowerCase().replace(/[\s-]/g, "").trim();
      
      if (cleanMobile && cleanInitiated) {
        return dbMobile === cleanMobile && dbInitiated === cleanInitiated;
      } else if (cleanMobile) {
        return dbMobile === cleanMobile;
      } else {
        return dbInitiated === cleanInitiated;
      }
    });
    
    return { success: true, data: matched };
  } catch (error) {
    console.error("Error finding offline profile", error);
    return { success: false, error: "Failed to search profiles" };
  }
}

export async function claimProfile(offlineDocId: string, uid: string, email: string | null) {
  try {
    const docRef = adminDb.collection("users").doc(offlineDocId);
    const docSnap = await docRef.get();
    if (!docSnap.exists) {
      return { success: false, error: "Offline profile not found" };
    }
    
    const offlineData = docSnap.data() as any;
    
    // Merge new auth details into the old record
    const mergedData = {
      ...offlineData,
      uid,
      email,
      isApproved: true,
      role: "USER" as const,
      updatedAt: new Date().toISOString(),
    };
    
    // Set to new document keyed by uid
    await adminDb.collection("users").doc(uid).set(mergedData);
    
    // Delete old document keyed by offline ID
    await adminDb.collection("users").doc(offlineDocId).delete();
    
    return { success: true };
  } catch (error) {
    console.error("Error claiming profile", error);
    return { success: false, error: "Failed to claim profile" };
  }
}
