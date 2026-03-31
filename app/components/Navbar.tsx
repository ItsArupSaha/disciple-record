"use client";

import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import styles from "./navbar.module.css";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { userProfile, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <nav className={styles.navbar}>
      <Link href="/dashboard" className={styles.brand}>
        Disciple Record - ISKCON Sylhet
      </Link>
      
      <div className={styles.links}>
        <Link href="/dashboard" className={styles.navLink}>
          ড্যাশবোর্ড (Dashboard)
        </Link>
        
        {userProfile && (userProfile.role === "ADMIN" || userProfile.role === "SUPER_ADMIN") && (
          <Link href="/admin" className={styles.navLink}>
            অ্যাডমিন প্যানেল (Admin Panel)
          </Link>
        )}
        
        <button onClick={handleSignOut} className={styles.logoutBtn}>
          লগ আউট (Log out)
        </button>
      </div>
    </nav>
  );
}
