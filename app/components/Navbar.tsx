"use client";

import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function Navbar() {
  const { userProfile, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const isAdmin = userProfile?.role === "ADMIN" || userProfile?.role === "SUPER_ADMIN";
  const brandHref = isAdmin ? "/admin" : "/dashboard";

  return (
    <nav className="w-full bg-gradient-to-r from-amber-600 to-orange-500 text-white shadow-md px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
      {/* Brand Logo */}
      <Link href={brandHref} className="font-extrabold text-lg sm:text-xl tracking-tight hover:opacity-95 transition flex items-center gap-2">
        <svg className="w-6 h-6 text-amber-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22C12 22 20 18 20 12C20 6.5 16.5 4 12 4C7.5 4 4 6.5 4 12C4 18 12 22 12 22Z" fill="currentColor" fillOpacity="0.2" />
          <path d="M12 4v18" />
          <path d="M8 8c2 2 6 2 8 0" />
        </svg>
        <span>ভক্ত তথ্য আর্কাইভ - ইসকন সিলেট</span>
      </Link>
      
      {/* Nav Links */}
      <div className="flex items-center gap-6">
        {/* Only show dashboard link to normal users */}
        {userProfile && userProfile.role === "USER" && (
          <Link href="/dashboard" className="text-sm font-bold hover:text-amber-100 transition duration-150">
            ড্যাশবোর্ড
          </Link>
        )}
        
        {/* Only show admin link to admins */}
        {isAdmin && (
          <Link href="/admin" className="text-sm font-bold hover:text-amber-100 transition duration-150">
            অ্যাডমিন প্যানেল
          </Link>
        )}
        
        {/* Logout Button */}
        <button 
          onClick={handleSignOut} 
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-xs font-bold transition cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          লগ আউট করুন
        </button>
      </div>
    </nav>
  );
}
