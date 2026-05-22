"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "./lib/firebase/client";
import { useAuth } from "./context/AuthContext";
import { LogOut, LayoutDashboard, UserPlus, ShieldAlert, Key } from "lucide-react";

export default function LandingPage() {
  const { user, userProfile, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [prabhupadaImgError, setPrabhupadaImgError] = useState(false);
  const [jpsImgError, setJpsImgError] = useState(false);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      await signInWithPopup(auth, googleProvider);
      router.push("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
      setIsLoggingIn(false);
      alert("লগইন করতে ব্যর্থ হয়েছে। দয়া করে আবার চেষ্টা করুন।");
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
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden font-sans">
        {/* Background Image with Blur */}
        <div className="absolute inset-0 bg-[url('/bg.png')] bg-cover bg-center opacity-30 blur-sm"></div>
        {/* Saffron Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-950/40 via-orange-950/45 to-yellow-950/40 z-0"></div>
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin"></div>
          <p className="text-amber-200 font-semibold text-lg tracking-wide animate-pulse">অপেক্ষা করুন...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between items-center relative overflow-hidden font-sans pb-12">
      {/* Saffron/Orange Accent Background */}
      <div className="absolute inset-0 bg-[url('/bg.png')] bg-cover bg-center opacity-10 pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50/40 via-amber-100/30 to-yellow-50/40 pointer-events-none"></div>

      {/* Main Content Card Container */}
      <main className="relative z-10 w-full max-w-4xl bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-amber-100/50 p-6 sm:p-10 my-8 flex flex-col gap-8 mx-4">
        
        {/* Header Section */}
        <div className="text-center flex flex-col items-center gap-3">
          {/* Decorative Lotus Logo */}
          <div className="p-3 bg-amber-50 rounded-full border border-amber-200/50 shadow-inner">
            <svg className="w-12 h-12 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22C12 22 20 18 20 12C20 6.5 16.5 4 12 4C7.5 4 4 6.5 4 12C4 18 12 22 12 22Z" fill="currentColor" fillOpacity="0.15" className="text-amber-500" />
              <path d="M12 4V22" />
              <path d="M12 12C12 12 16 10 16 7.5C16 5 14 4 12 4C10 4 8 5 8 7.5C8 10 12 12 12 12Z" />
              <path d="M12 12C12 12 18 15 18 17.5C18 20 15 21 12 21C9 21 6 20 6 17.5C6 15 12 12 12 12Z" />
              <path d="M12 12C12 12 19 11 19 8.5C19 6 16.5 5.5 14.5 7.5C12.5 9.5 12 12 12 12Z" />
              <path d="M12 12C12 12 5 11 5 8.5C5 6 7.5 5.5 9.5 7.5C11.5 9.5 12 12 12 12Z" />
            </svg>
          </div>
          
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-amber-800 tracking-tight">
              দীক্ষাপ্রাপ্ত ভক্ত তথ্য আর্কাইভ
            </h1>
            <p className="text-lg sm:text-xl font-bold text-amber-700 mt-2">
              ইসকন সিলেট
            </p>
          </div>
          
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent mt-1"></div>
          
          <p className="text-sm sm:text-base text-slate-600 max-w-xl leading-relaxed mt-2">
            শ্রীল প্রভুপাদ এবং শ্রীল জয়পতাকা স্বামী গুরুমহারাজের চরণে আমাদের বিনম্র শ্রদ্ধাঞ্জলি। এই আর্কাইভটি ইসকন সিলেটের দীক্ষাপ্রাপ্ত ভক্তদের সকল প্রয়োজনীয় তথ্য ও রেকর্ড সংগ্রহ ও সুশৃঙ্খলভাবে সংরক্ষণের জন্য নিবেদিত।
          </p>
        </div>

        {/* Gurus Quote Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mt-2">
          {/* Srila Prabhupada Card */}
          <div className="bg-gradient-to-b from-amber-50/70 to-orange-50/40 border border-amber-200/50 rounded-2xl p-6 flex flex-col items-center text-center shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-md mb-4 bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-white font-bold relative group">
              {!prabhupadaImgError ? (
                <img 
                  src="/prabhupada.jpg" 
                  alt="Srila Prabhupada" 
                  onError={() => setPrabhupadaImgError(true)}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <span className="text-2xl font-serif tracking-widest text-amber-100">SP</span>
              )}
            </div>
            <p className="text-slate-700 italic text-sm sm:text-base leading-relaxed flex-1 flex items-center justify-center font-medium px-2">
              "গ্রন্থ হচ্ছে ভিত্তি, প্রচার হচ্ছে সার, উপযোগিতা হচ্ছে মূলনীতি, আর পবিত্রতা হচ্ছে শক্তি।"
            </p>
            <div className="mt-4">
              <h3 className="text-amber-800 font-bold text-sm">জগদ্গুরু শ্রীল অভয়চরণারবিন্দ ভক্তিবেদান্ত স্বামী প্রভুপাদ</h3>
              <p className="text-amber-600 text-xs font-semibold uppercase tracking-wider mt-0.5">ইসকনের প্রতিষ্ঠাতা-আচার্য</p>
            </div>
          </div>

          {/* Srila Jayapataka Swami Card */}
          <div className="bg-gradient-to-b from-amber-50/70 to-orange-50/40 border border-amber-200/50 rounded-2xl p-6 flex flex-col items-center text-center shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-md mb-4 bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-white font-bold relative group">
              {!jpsImgError ? (
                <img 
                  src="/jps.jpg" 
                  alt="Srila Jayapataka Swami" 
                  onError={() => setJpsImgError(true)}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <span className="text-2xl font-serif tracking-widest text-amber-100">JPS</span>
              )}
            </div>
            <p className="text-slate-700 italic text-sm sm:text-base leading-relaxed flex-1 flex items-center justify-center font-medium px-2">
              "দয়া করে কৃষ্ণভাবনামৃতকে অত্যন্ত গুরুত্ব সহকারে গ্রহণ করুন এবং আপনারা ইহলোক ও পরলোকে সুখী হবেন।"
            </p>
            <div className="mt-4">
              <h3 className="text-amber-800 font-bold text-sm">পরম পূজ্য শ্রীল জয়পতাকা স্বামী মহারাজ</h3>
              <p className="text-amber-600 text-xs font-semibold uppercase tracking-wider mt-0.5">দীক্ষা ও শিক্ষা গুরু</p>
            </div>
          </div>
        </div>

        {/* Action/Login Control Panel */}
        <div className="bg-amber-50/55 border border-amber-200/40 rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center gap-4 w-full shadow-inner mt-4">
          {user && userProfile ? (
            // Logged in with a valid profile
            <div className="w-full text-center flex flex-col items-center gap-4">
              {userProfile.role === "ADMIN" || userProfile.role === "SUPER_ADMIN" ? (
                <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-6 py-3.5 text-indigo-800 text-sm font-semibold max-w-lg shadow-sm flex items-center gap-2">
                  <Key className="w-5 h-5 text-indigo-500 shrink-0" />
                  <span>হরে কৃষ্ণ! আপনি সফলভাবে অ্যাডমিন হিসেবে প্রবেশ করেছেন।</span>
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-6 py-3.5 text-emerald-800 text-sm font-semibold max-w-lg shadow-sm">
                  হরে কৃষ্ণ! আপনি সফলভাবে দীক্ষাপ্রাপ্ত ভক্ত আর্কাইভে প্রবেশ করেছেন।
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
                <button 
                  onClick={handleGoToDashboard} 
                  className="w-full sm:w-64 py-3 px-6 bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-700 hover:to-orange-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition duration-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LayoutDashboard className="w-5 h-5" />
                  {userProfile.role === "ADMIN" || userProfile.role === "SUPER_ADMIN" 
                    ? "অ্যাডমিন প্যানেলে প্রবেশ করুন" 
                    : "ড্যাশবোর্ডে প্রবেশ করুন"}
                </button>
                <button 
                  onClick={async () => { await signOut(); router.push("/"); }}
                  className="w-full sm:w-48 py-3 px-6 bg-slate-600 hover:bg-slate-700 text-white font-bold rounded-xl shadow hover:shadow-md transition duration-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  লগ আউট করুন
                </button>
              </div>
            </div>
          ) : user && !userProfile ? (
            // Logged in but profile doesn't exist (needs onboarding)
            <div className="w-full text-center flex flex-col items-center gap-4">
              <div className="bg-amber-50 border border-amber-200 text-amber-800 px-6 py-4 rounded-xl text-sm font-medium max-w-lg shadow-sm flex flex-col gap-1 items-center">
                <ShieldAlert className="w-6 h-6 text-amber-600" />
                <span className="font-bold text-base mt-1">ভক্ত প্রোফাইল খুঁজে পাওয়া যায়নি!</span>
                <span className="text-slate-600 text-xs mt-1">আপনার গুগল লগইন সফল হয়েছে। তবে সিস্টেমে তথ্য যুক্ত করার জন্য অনুগ্রহ করে আপনার ভক্ত প্রোফাইল নিবন্ধন সম্পন্ন করুন।</span>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
                <button 
                  onClick={() => router.push("/onboarding")} 
                  className="w-full sm:w-64 py-3 px-6 bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-700 hover:to-orange-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition duration-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <UserPlus className="w-5 h-5" />
                  নিবন্ধন ফর্ম পূরণ করুন
                </button>
                <button 
                  onClick={async () => { await signOut(); router.push("/"); }}
                  className="w-full sm:w-44 py-3 px-6 bg-slate-600 hover:bg-slate-700 text-white font-bold rounded-xl shadow hover:shadow-md transition duration-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  লগ আউট করুন
                </button>
              </div>
            </div>
          ) : (
            // Guest (Not logged in)
            <div className="w-full text-center flex flex-col items-center gap-3">
              <p className="text-slate-600 text-xs sm:text-sm font-medium mb-1">
                নিরাপদে তথ্য আর্কাইভ দেখতে ও আপনার প্রোফাইল অ্যাক্সেস করতে অনুগ্রহ করে গুগল অ্যাকাউন্ট দিয়ে প্রবেশ করুন।
              </p>
              
              <button 
                onClick={handleLogin} 
                className="w-full max-w-xs py-3 px-6 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-xl shadow-sm hover:shadow-md transition duration-200 flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? (
                  <div className="w-5 h-5 border-2 border-slate-200 border-t-amber-600 rounded-full animate-spin"></div>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    গুগল অ্যাকাউন্ট দিয়ে প্রবেশ করুন
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer Section */}
      <footer className="relative z-10 text-center text-xs text-amber-800/80 font-medium">
        © {new Date().getFullYear()} ইসকন সিলেট দীক্ষাপ্রাপ্ত ভক্ত তথ্য আর্কাইভ। সর্বস্বত্ব সংরক্ষিত।
      </footer>
    </div>
  );
}
