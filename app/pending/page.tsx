"use client";

import { useAuth } from "../context/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";
import styles from "../onboarding/page.module.css";
import { useRouter } from "next/navigation";

export default function PendingPage() {
  const { signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <ProtectedRoute>
      <div className={styles.container}>
        <div className={styles.formCard} style={{ textAlign: "center" }}>
          <h1 className={styles.title} style={{ color: "#b45309" }}>অনুমোদনের অপেক্ষায়</h1>
          <p className={styles.subtitle} style={{ fontSize: "1.1rem", marginTop: "1rem", color: "#475569" }}>
            আপনার তথ্য সফলভাবে জমা দেওয়া হয়েছে।<br/>
            (Your information has been successfully submitted.)
          </p>
          <p style={{ marginBottom: "2rem", color: "#334155", lineHeight: 1.6 }}>
            দয়া করে অ্যাডমিন কর্তৃক আপনার আইডি অনুমোদনের জন্য অপেক্ষা করুন। অনুমোদন পাওয়ার পর আপনি এখানে লগইন করতে পারবেন।<br/>
            (Please wait for an admin to approve your account. Once approved, you will be able to access the dashboard.)
          </p>
          
          <button onClick={handleSignOut} className={styles.submitBtn} style={{ background: "#64748b", maxWidth: "250px", margin: "0 auto" }}>
            লগ আউট (Log out)
          </button>
        </div>
      </div>
    </ProtectedRoute>
  );
}
