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
      name: data.name,
      initiatedName: data.initiatedName,
      address: data.address,
      mobileNumber: normalizeNumbers(data.mobileNumber),
      whatsappNumber: normalizeNumbers(data.whatsappNumber),
      bloodGroup: data.bloodGroup,
      joinedIskconDate: normalizeNumbers(data.joinedIskconDate),
      initiatedYear: normalizeNumbers(data.initiatedYear),
      spiritualMaster: data.spiritualMaster,
      profileImageURL: data.profileImageURL,
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
