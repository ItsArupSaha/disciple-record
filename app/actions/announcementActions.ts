"use server";

import { adminDb } from "../lib/firebase/admin";

export async function createAnnouncement(title: string, message: string, createdBy: string, email: string) {
  try {
    const superAdminEmails = process.env.SUPERADMIN_EMAILS?.split(',') || [];
    if (!superAdminEmails.includes(email)) {
      return { success: false, error: "Unauthorized" };
    }

    const docRef = adminDb.collection("announcements").doc();
    await docRef.set({
      id: docRef.id,
      title,
      message,
      createdBy,
      createdAt: new Date().toISOString(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error creating announcement", error);
    return { success: false, error: "Failed to create announcement" };
  }
}

export async function getAnnouncements() {
  try {
    const snapshot = await adminDb.collection("announcements").orderBy("createdAt", "desc").get();
    const data = snapshot.docs.map(doc => doc.data());
    return { success: true, data };
  } catch (error) {
    console.error("Error fetching announcements", error);
    return { success: false, error: "Failed to load announcements" };
  }
}
