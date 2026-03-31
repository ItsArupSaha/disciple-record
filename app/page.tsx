"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithPopup, setPersistence, browserSessionPersistence } from "firebase/auth";
import { auth, googleProvider } from "./lib/firebase/client";
import { useAuth } from "./context/AuthContext";
import styles from "./page.module.css";
// ... (I'll extract and replace lines carefully)
import Image from "next/image";

export default function LandingPage() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    // Intentionally no longer redirecting automatically 
    // so logged-in users can still appreciate the Devotional Landing Page
  }, []);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      await signInWithPopup(auth, googleProvider);
      router.push("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
      setIsLoggingIn(false);
      alert("Failed to login. Please try again.");
    }
  };

  const handleGoToDashboard = () => {
    if (userProfile?.role === "ADMIN" || userProfile?.role === "SUPER_ADMIN") {
      router.push("/admin");
    } else {
      router.push("/dashboard");
    }
  };

  if (authLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.overlay}></div>
        <div className={styles.content} style={{ zIndex: 10 }}>
           <div className={styles.loader}></div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.overlay}></div>
      <main className={styles.content}>
        
        <div className={styles.header}>
          <h1 className={styles.title}>Disciple Record</h1>
          <h2 className={styles.subtitle}>ISKCON Sylhet</h2>
        </div>

        <div className={styles.portraits}>
          <div className={styles.portraitCard}>
            <div className={styles.imagePlaceholder}>
              Srila Prabhupada
              {/* <Image src="/prabhupada.jpg" alt="Srila Prabhupada" width={140} height={140} className="rounded-full object-cover" /> */}
            </div>
            <p className={styles.quote}>
              "Books are the basis, preaching is the essence, utility is the principle, purity is the force."
            </p>
            <span className={styles.author}>Srila Prabhupada</span>
          </div>

          <div className={styles.portraitCard}>
            <div className={styles.imagePlaceholder}>
              Jayapataka Swami
              {/* <Image src="/jps.jpg" alt="Srila Jayapataka Swami" width={140} height={140} className="rounded-full object-cover" /> */}
            </div>
            <p className={styles.quote}>
              "Please take Krishna Consciousness very seriously and you will be happy in this life and the next."
            </p>
            <span className={styles.author}>Srila Jayapataka Swami</span>
          </div>
        </div>

        <div className={styles.action}>
          {user && userProfile ? (
            <button onClick={handleGoToDashboard} className={styles.googleBtn}>
              {userProfile.role === "ADMIN" || userProfile.role === "SUPER_ADMIN" 
                ? "অ্যাডমিন প্যানেলে যান (Go to Admin Panel)" 
                : "ড্যাশবোর্ডে যান (Go to Dashboard)"}
            </button>
          ) : user && !userProfile ? (
            <button onClick={() => router.push("/onboarding")} className={styles.googleBtn}>
              নিবন্ধন সম্পূর্ণ করুন (Complete Registration)
            </button>
          ) : (
            <button 
              onClick={handleLogin} 
              className={styles.googleBtn}
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <div className={styles.loader}></div>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    <path d="M1 1h22v22H1z" fill="none"/>
                  </svg>
                  Continue with Google
                </>
              )}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
