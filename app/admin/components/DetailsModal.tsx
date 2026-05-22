"use client";

import { X, User, Phone, MapPin, Calendar, Award, BookOpen } from "lucide-react";
import { UserProfile } from "../../context/AuthContext";

interface DetailsModalProps {
  user: UserProfile;
  onClose: () => void;
}

export default function DetailsModal({ user, onClose }: DetailsModalProps) {
  const sections = [
    {
      title: "১. ব্যক্তিগত বিবরণী (Personal Info)",
      icon: User,
      fields: [
        { label: "নাম (Name)", value: user.name },
        { label: "দীক্ষানাম (Initiated Name)", value: user.initiatedName },
        { label: "জন্ম তারিখ (DOB)", value: user.dob },
        { label: "লিঙ্গ (Gender)", value: user.gender },
        { label: "রক্তের গ্রুপ (Blood Group)", value: user.bloodGroup },
        { label: "বৈবাহিক অবস্থা (Marital Status)", value: user.maritalStatus },
        { label: "পেশা (Occupation)", value: user.occupation },
      ],
    },
    {
      title: "২. যোগাযোগের বিবরণী (Contact Info)",
      icon: Phone,
      fields: [
        { label: "মোবাইল নম্বর (Mobile)", value: user.mobileNumber },
        { label: "WhatsApp নম্বর (WhatsApp)", value: user.whatsappNumber },
        { label: "বর্তমান ঠিকানা (Present Address)", value: user.presentAddress },
        { label: "স্থায়ী ঠিকানা (Permanent Address)", value: user.permanentAddress },
      ],
    },
    {
      title: "৩. দীক্ষা সংক্রান্ত বিবরণী (Initiation Info)",
      icon: Award,
      fields: [
        { label: "দীক্ষাগুরু (Spiritual Master)", value: user.spiritualMaster },
        { label: "হরিনাম দীক্ষা (Harinam)", value: user.harinamInitiation },
        { label: "দীক্ষা বছর (Initiated Year)", value: user.initiatedYear },
        { label: "দীক্ষার স্থান (Initiation Place)", value: user.initiationPlace },
        { label: "ব্রাহ্মন দীক্ষা (Brahman)", value: user.brahmanInitiation },
        { label: "ব্রাহ্মন দীক্ষা তারিখ (Brahman Date)", value: user.brahmanInitiationDate },
        { label: "ব্রাহ্মন দীক্ষা স্থান (Brahman Place)", value: user.brahmanInitiationPlace },
        { label: "আশ্রিত তারিখ (Shelter Date)", value: user.shelteredDate },
        { label: "ইস্‌কনে যুক্ত হওয়ার সাল (Joined ISKCON)", value: user.joinedIskconDate },
        { label: "কাউন্সিলর/শিক্ষাগুরু (Counselor)", value: user.counselorName },
      ],
    },
    {
      title: "৪. সেবা ও সংযোগ (Service & Connection)",
      icon: BookOpen,
      fields: [
        { label: "কোন বিভাগের সাথে যুক্ত (Dept)", value: user.department },
        { label: "সেবা (Service)", value: user.service },
        { label: "সাধনা গ্রন্থ (Sadhana Grantha)", value: user.sadhanaGrantha },
        { label: "নামহট্টের সাথে যুক্ত? (Is Namahatta)", value: user.isNamahattaConnected },
        { label: "নামহট্টের নাম (Namahatta Name)", value: user.namahattaName },
        { label: "সিরিয়েল নং (Serial No)", value: user.serialNo },
        { label: "পুরাতন সিরিয়েল নং (Old Serial No)", value: user.oldSerialNo },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-orange-500 p-6 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            {user.profileImageURL ? (
              <img
                src={user.profileImageURL}
                alt={user.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md bg-slate-100"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xl border-2 border-white shadow-md">
                {user.name?.charAt(0) || "D"}
              </div>
            )}
            <div>
              <h3 className="text-xl font-bold">{user.initiatedName || "দীক্ষানাম নেই"}</h3>
              <p className="text-amber-100 text-sm">{user.name} | Role: {user.role}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 bg-slate-50 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sections.map((section) => (
              <div key={section.title} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2 text-amber-700 font-bold">
                  <section.icon className="w-5 h-5" />
                  <span>{section.title}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                  {section.fields.map((f, i) => (
                    <div key={i} className="space-y-0.5 sm:col-span-1 odd:sm:col-span-1 last:odd:sm:col-span-2">
                      <span className="text-xs font-semibold text-slate-400 block">{f.label}</span>
                      <span className="text-sm font-medium text-slate-800 break-words">{f.value || "—"}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg transition"
          >
            বন্ধ করুন (Close)
          </button>
        </div>
      </div>
    </div>
  );
}
