"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../lib/firebase/client";
import { submitOnboarding } from "../actions/userActions";
import styles from "./page.module.css";

export default function OnboardingPage() {
  const { user, refreshProfile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const photoFile = formData.get("profilePhoto") as File;
    let profileImageURL = "";

    // Upload photo if present
    if (photoFile && photoFile.size > 0) {
      try {
        const fileRef = ref(storage, `profile_photos/${user.uid}`);
        const uploadResult = await uploadBytes(fileRef, photoFile);
        profileImageURL = await getDownloadURL(uploadResult.ref);
      } catch (err) {
        console.error("Photo upload failed", err);
        setError("ছবি আপলোড ব্যর্থ হয়েছে। (Photo upload failed)");
        setLoading(false);
        return;
      }
    }

    const data = {
      name: formData.get("name") as string,
      initiatedName: formData.get("initiatedName") as string,
      address: {
        division: formData.get("division") as string,
        district: formData.get("district") as string,
        thana: formData.get("thana") as string,
      },
      mobileNumber: formData.get("mobileNumber") as string,
      whatsappNumber: formData.get("whatsappNumber") as string,
      bloodGroup: formData.get("bloodGroup") as string,
      joinedIskconDate: formData.get("joinedIskconDate") as string,
      initiatedYear: formData.get("initiatedYear") as string,
      spiritualMaster: formData.get("spiritualMaster") as string,
      profileImageURL,
    };

    // basic validation for english digits
    if (!/^[0-9+]*$/.test(data.mobileNumber)) {
      setError("মোবাইল নম্বর শুধুমাত্র ইংরেজিতে (English digits) দিতে হবে।");
      setLoading(false);
      return;
    }

    const result = await submitOnboarding(data, user.uid, user.email);
    if (result && result.success) {
      // Force refresh the context so it sees the new userProfile
      await refreshProfile();
      // Router redirection is handled via ProtectedRoute or effects in AuthContext
    } else {
      setError("তথ্য সংরক্ষণে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন। (Failed to save data)");
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className={styles.container}>
        <div className={styles.formCard}>
          <h1 className={styles.title}>আপনার তথ্য দিন</h1>
          <p className={styles.subtitle}>Please provide your information</p>
          
          {error && <div className={styles.error} style={{marginBottom: '1rem', textAlign: 'center'}}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>নাম (Name) *</label>
              <input type="text" name="name" required className={styles.input} />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>প্রোফাইল ছবি (Profile Photo)</label>
              <input type="file" name="profilePhoto" accept="image/*" className={styles.input} style={{padding: '0.4rem'}} />
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>দীক্ষাপ্রাপ্ত নাম (Initiated Name) *</label>
              <input type="text" name="initiatedName" required className={styles.input} 
                placeholder="Ex: Ananda Svarupa Nitai Das" />
            </div>

            <h3 style={{marginTop: '2rem', marginBottom: '1rem', color: '#334155', fontWeight: 600}}>ঠিকানা (Address)</h3>
            <div className={styles.fieldRow}>
              <div>
                <label className={styles.label}>বিভাগ (Division) *</label>
                <input type="text" name="division" required className={styles.input} />
              </div>
              <div>
                <label className={styles.label}>জেলা (District) *</label>
                <input type="text" name="district" required className={styles.input} />
              </div>
            </div>
            
            <div className={styles.fieldGroup}>
              <label className={styles.label}>থানা / এলাকা (Thana) *</label>
              <input type="text" name="thana" required className={styles.input} />
            </div>

            <h3 style={{marginTop: '2rem', marginBottom: '1rem', color: '#334155', fontWeight: 600}}>যোগাযোগ (Contact)</h3>
            <div className={styles.fieldRow}>
              <div>
                <label className={styles.label}>মোবাইল নম্বর (Mobile Number) - English Only *</label>
                <input type="tel" name="mobileNumber" required pattern="[0-9+]*" className={styles.input} placeholder="017..." />
              </div>
              <div>
                <label className={styles.label}>হোয়াটসঅ্যাপ (WhatsApp) - Optional</label>
                <input type="tel" name="whatsappNumber" pattern="[0-9+]*" className={styles.input} placeholder="017..." />
              </div>
            </div>

            <h3 style={{marginTop: '2rem', marginBottom: '1rem', color: '#334155', fontWeight: 600}}>দীক্ষা সম্পর্কিত তথ্য (Initiation Info)</h3>
            <div className={styles.fieldRow}>
              <div>
                <label className={styles.label}>ইসকনে যোগদানের সাল (Joined ISKCON Year) *</label>
                <input type="text" name="joinedIskconDate" required className={styles.input} />
              </div>
              <div>
                <label className={styles.label}>দীক্ষাপ্রাপ্ত সাল (Initiated Year) *</label>
                <input type="text" name="initiatedYear" required className={styles.input} />
              </div>
            </div>

            <div className={styles.fieldRow}>
              <div>
                <label className={styles.label}>দীক্ষাগুরু (Spiritual Master) *</label>
                <input type="text" name="spiritualMaster" required className={styles.input} defaultValue="HH Jayapataka Swami" />
              </div>
              <div>
                <label className={styles.label}>রক্তের গ্রুপ (Blood Group) *</label>
                <select name="bloodGroup" required className={styles.input}>
                  <option value="">Select...</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>
            </div>

            <button type="submit" disabled={loading} className={styles.submitBtn}>
              {loading ? "সংরক্ষণ করা হচ্ছে..." : "জমা দিন (Submit)"}
            </button>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  );
}
