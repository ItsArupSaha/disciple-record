"use client";

import ProtectedRoute from "../components/ProtectedRoute";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { User, Phone, MapPin, Award, BookOpen, Printer } from "lucide-react";

export default function DashboardPage() {
  const { userProfile } = useAuth();

  const handlePrint = () => {
    window.print();
  };

  if (!userProfile) return null;

  return (
    <ProtectedRoute allowedRoles={["USER", "ADMIN", "SUPER_ADMIN"]}>
      <div className="min-h-screen bg-slate-100 font-sans print:bg-white pb-12">
        <div className="print:hidden">
          <Navbar />
        </div>
        
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 print:p-0 print:max-w-full">
          
          {/* Welcome & Profile Header */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6 print:border-none print:shadow-none print:p-0">
            <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
              {/* Profile Image / Initials */}
              {userProfile.profileImageURL ? (
                <img 
                  src={userProfile.profileImageURL} 
                  alt={userProfile.name} 
                  className="w-24 h-24 rounded-full object-cover border-4 border-amber-100 shadow-md bg-slate-100 print:w-20 print:h-20"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center font-extrabold text-3xl shadow-md border-4 border-amber-100 print:w-20 print:h-20">
                  {userProfile.name?.charAt(0) || "D"}
                </div>
              )}
              
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800">
                  হরে কৃষ্ণ, {userProfile.initiatedName || userProfile.name}
                </h1>
                <p className="text-slate-500 text-sm sm:text-base mt-1">
                  দীক্ষাপ্রাপ্ত ভক্ত তথ্য আর্কাইভে আপনাকে স্বাগতম। নিচে আপনার সংরক্ষিত প্রোফাইলের বিবরণ দেওয়া হলো।
                </p>
                <div className="mt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
                  <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 text-xs font-bold rounded-full border border-amber-200">
                    ID: {userProfile.serialNo || "—"}
                  </span>
                  <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-full border border-slate-200">
                    ভূমিকা: {userProfile.role === "USER" ? "ভক্ত" : "অ্যাডমিন"}
                  </span>
                </div>
              </div>
            </div>

            {/* Print Button */}
            <button 
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-xl text-sm transition shadow-xs cursor-pointer print:hidden shrink-0"
            >
              <Printer className="w-4 h-4" />
              প্রোফাইল প্রিন্ট করুন
            </button>
          </div>

          {/* Profile Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:grid-cols-2 print:gap-4">
            
            {/* Section 1: Personal Details */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4 print:border print:shadow-none">
              <h3 className="text-lg font-bold text-slate-850 border-b border-slate-100 pb-2 flex items-center gap-2">
                <User className="w-5 h-5 text-amber-600" />
                ব্যক্তিগত বিবরণ (Personal Info)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm print:grid-cols-2">
                <div>
                  <span className="block text-xs font-semibold text-slate-400">সিরিয়াল নম্বর</span>
                  <span className="font-semibold text-slate-800">{userProfile.serialNo || "—"}</span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-slate-400">পুরাতন সিরিয়াল নম্বর</span>
                  <span className="font-semibold text-slate-800">{userProfile.oldSerialNo || "—"}</span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-slate-400">দীক্ষানাম</span>
                  <span className="font-bold text-amber-700">{userProfile.initiatedName || "—"}</span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-slate-400">নাম (সার্টিফিকেট অনুযায়ী)</span>
                  <span className="font-semibold text-slate-800">{userProfile.name || "—"}</span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-slate-400">জন্ম তারিখ</span>
                  <span className="font-semibold text-slate-800">{userProfile.dob || "—"}</span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-slate-400">লিঙ্গ</span>
                  <span className="font-semibold text-slate-800">{userProfile.gender || "—"}</span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-slate-400">বৈবাহিক অবস্থা</span>
                  <span className="font-semibold text-slate-800">{userProfile.maritalStatus || "—"}</span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-slate-400">রক্তের গ্রুপ</span>
                  <span className="font-semibold text-slate-800">
                    {userProfile.bloodGroup ? (
                      <span className="px-2 py-0.5 bg-red-50 text-red-700 text-xs font-bold rounded border border-red-150">
                        {userProfile.bloodGroup}
                      </span>
                    ) : "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* Section 2: Contact Details */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4 print:border print:shadow-none">
              <h3 className="text-lg font-bold text-slate-850 border-b border-slate-100 pb-2 flex items-center gap-2">
                <Phone className="w-5 h-5 text-amber-600" />
                যোগাযোগের তথ্য (Contact Info)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm print:grid-cols-2">
                <div>
                  <span className="block text-xs font-semibold text-slate-400">মোবাইল নম্বর</span>
                  <span className="font-bold text-slate-800">{userProfile.mobileNumber || "—"}</span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-slate-400">হোয়াটসঅ্যাপ নম্বর</span>
                  <span className="font-semibold text-slate-800">{userProfile.whatsappNumber || "—"}</span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-slate-400">ইমেইল ঠিকানা</span>
                  <span className="font-semibold text-slate-800">{userProfile.email || "—"}</span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-slate-400">পেশা</span>
                  <span className="font-semibold text-slate-800">{userProfile.occupation || "—"}</span>
                </div>
                <div className="sm:col-span-2 print:col-span-2">
                  <span className="block text-xs font-semibold text-slate-400">বর্তমান ঠিকানা</span>
                  <span className="font-semibold text-slate-800 flex items-start gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5 print:hidden" />
                    {userProfile.presentAddress || "—"}
                  </span>
                </div>
                <div className="sm:col-span-2 print:col-span-2">
                  <span className="block text-xs font-semibold text-slate-400">স্থায়ী ঠিকানা</span>
                  <span className="font-semibold text-slate-800 flex items-start gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5 print:hidden" />
                    {userProfile.permanentAddress || "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* Section 3: Initiation & Spiritual details */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4 print:border print:shadow-none md:col-span-2 print:col-span-2">
              <h3 className="text-lg font-bold text-slate-850 border-b border-slate-100 pb-2 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-600" />
                দীক্ষা ও আধ্যাত্মিক তথ্য (Initiation & Spiritual Info)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm print:grid-cols-3 print:gap-4">
                <div>
                  <span className="block text-xs font-semibold text-slate-400">আধ্যাত্মিক গুরুদেব</span>
                  <span className="font-bold text-amber-800">{userProfile.spiritualMaster || "—"}</span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-slate-400">ইস্‌কনে যুক্ত হওয়ার তারিখ</span>
                  <span className="font-semibold text-slate-850">{userProfile.joinedIskconDate || "—"}</span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-slate-400">আশ্রিত তারিখ ও সাল</span>
                  <span className="font-semibold text-slate-850">{userProfile.shelteredDate || "—"}</span>
                </div>

                <div className="border-t border-slate-100 sm:col-span-3 my-1 print:hidden"></div>

                <div>
                  <span className="block text-xs font-semibold text-slate-400">হরিনাম দীক্ষা</span>
                  <span className="font-bold text-slate-800">{userProfile.harinamInitiation || "—"}</span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-slate-400">দীক্ষা তারিখ ও সাল</span>
                  <span className="font-semibold text-slate-850">{userProfile.initiatedYear || "—"}</span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-slate-400">দীক্ষার স্থান</span>
                  <span className="font-semibold text-slate-850">{userProfile.initiationPlace || "—"}</span>
                </div>

                <div className="border-t border-slate-100 sm:col-span-3 my-1 print:hidden"></div>

                <div>
                  <span className="block text-xs font-semibold text-slate-400">ব্রাহ্মণ দীক্ষা</span>
                  <span className="font-bold text-slate-800">{userProfile.brahmanInitiation || "—"}</span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-slate-400">ব্রাহ্মণ দীক্ষার তারিখ ও সাল</span>
                  <span className="font-semibold text-slate-850">{userProfile.brahmanInitiationDate || "—"}</span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-slate-400">ব্রাহ্মণ দীক্ষার স্থান</span>
                  <span className="font-semibold text-slate-850">{userProfile.brahmanInitiationPlace || "—"}</span>
                </div>
              </div>
            </div>

            {/* Section 4: Service & Organizational details */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4 print:border print:shadow-none md:col-span-2 print:col-span-2">
              <h3 className="text-lg font-bold text-slate-850 border-b border-slate-100 pb-2 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-600" />
                সেবা ও সাংগঠনিক তথ্য (Service & Organizational Info)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm print:grid-cols-3 print:gap-4">
                <div>
                  <span className="block text-xs font-semibold text-slate-400">কাউন্সিলর বা শিক্ষাগুরুর নাম</span>
                  <span className="font-semibold text-slate-850">{userProfile.counselorName || "—"}</span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-slate-400">কোন বিভাগের সাথে যুক্ত</span>
                  <span className="font-semibold text-slate-850">{userProfile.department || "—"}</span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-slate-400">সেবা</span>
                  <span className="font-semibold text-slate-850">{userProfile.service || "—"}</span>
                </div>
                
                <div className="border-t border-slate-100 sm:col-span-3 my-1 print:hidden"></div>

                <div>
                  <span className="block text-xs font-semibold text-slate-400">সাধনা গ্রন্থ</span>
                  <span className="font-semibold text-slate-850">{userProfile.sadhanaGrantha || "—"}</span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-slate-400">নামহট্টের সাথে যুক্ত?</span>
                  <span className="font-semibold text-slate-850">{userProfile.isNamahattaConnected || "—"}</span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-slate-400">নামহট্টের নাম</span>
                  <span className="font-semibold text-slate-850">{userProfile.namahattaName || "—"}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Verification Notice at the bottom for print */}
          <div className="hidden print:block text-center mt-12 text-xs text-slate-400">
            তথ্যটি ইসকন সিলেট ভক্ত রেকর্ড আর্কাইভ থেকে স্বয়ংক্রিয়ভাবে তৈরি হয়েছে। প্রিন্ট করার তারিখ: {new Date().toLocaleDateString("bn-BD")}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
