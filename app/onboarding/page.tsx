"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";
import ClaimProfile from "./components/ClaimProfile";
import RegisterForm from "./components/RegisterForm";
import { UserCheck, UserPlus, LogOut } from "lucide-react";

export default function OnboardingPage() {
  const { refreshProfile, signOut } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"claim" | "register">("claim");

  const handleSuccess = async () => {
    await refreshProfile();
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-100 py-4 sm:py-8 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center font-sans">
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden transition-all duration-300">
          
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-amber-600 to-orange-500 pt-14 pb-5 px-4 sm:p-6 md:p-8 text-center text-white relative shadow-inner">
            <button
              onClick={async () => {
                await signOut();
                router.push("/");
              }}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-xs font-semibold transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              লগ আউট (Log out)
            </button>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight">দীক্ষাপ্রাপ্ত ভক্ত তথ্য আর্কাইভ</h1>
            <p className="mt-1 text-amber-100 text-xs sm:text-sm md:text-lg">Initiated Disciple Information Archive - ISKCON Sylhet</p>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-slate-200 bg-slate-50">
            <button
              onClick={() => setActiveTab("claim")}
              className={`flex-1 py-2.5 px-4 font-semibold text-center border-b-2 flex items-center justify-center gap-2 transition duration-200 text-sm sm:text-base ${
                activeTab === "claim" 
                  ? "border-amber-600 text-amber-700 bg-white shadow-sm" 
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100"
              }`}
            >
              <UserCheck className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
              পূর্বের রেকর্ড দাবি করুন (Claim Profile)
            </button>
            <button
              onClick={() => setActiveTab("register")}
              className={`flex-1 py-2.5 px-4 font-semibold text-center border-b-2 flex items-center justify-center gap-2 transition duration-200 text-sm sm:text-base ${
                activeTab === "register" 
                  ? "border-amber-600 text-amber-700 bg-white shadow-sm" 
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100"
              }`}
            >
              <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
              নতুন নিবন্ধন (Register New)
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-5 sm:p-6 md:p-8">
            {activeTab === "claim" ? (
              <ClaimProfile onSuccess={handleSuccess} />
            ) : (
              <RegisterForm onSuccess={handleSuccess} />
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
