"use client";

import React, { useState } from "react";
import { useAuth, UserProfile } from "../../context/AuthContext";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../lib/firebase/client";
import { submitOnboarding } from "../../actions/userActions";
import { UserPlus, Image as ImageIcon, AlertCircle, CheckCircle } from "lucide-react";

interface RegisterFormProps {
  onSuccess: () => void;
}

export default function RegisterForm({ onSuccess }: RegisterFormProps) {
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPhotoPreview(null);
    }
  };

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

    const data: Partial<UserProfile> = {
      name: formData.get("name") as string,
      initiatedName: formData.get("initiatedName") as string,
      mobileNumber: formData.get("mobileNumber") as string,
      whatsappNumber: formData.get("whatsappNumber") as string,
      bloodGroup: formData.get("bloodGroup") as string,
      joinedIskconDate: formData.get("joinedIskconDate") as string,
      initiatedYear: formData.get("initiatedYear") as string,
      initiationPlace: formData.get("initiationPlace") as string,
      counselorName: formData.get("counselorName") as string,
      presentAddress: formData.get("presentAddress") as string,
      permanentAddress: formData.get("permanentAddress") as string,
      dob: formData.get("dob") as string,
      occupation: formData.get("occupation") as string,
      gender: formData.get("gender") as string,
      maritalStatus: formData.get("maritalStatus") as string,
      harinamInitiation: formData.get("harinamInitiation") as string,
      brahmanInitiation: formData.get("brahmanInitiation") as string,
      brahmanInitiationDate: formData.get("brahmanInitiationDate") as string,
      brahmanInitiationPlace: formData.get("brahmanInitiationPlace") as string,
      department: formData.get("department") as string,
      service: formData.get("service") as string,
      sadhanaGrantha: formData.get("sadhanaGrantha") as string,
      shelteredDate: formData.get("shelteredDate") as string,
      namahattaName: formData.get("namahattaName") as string,
      isNamahattaConnected: formData.get("isNamahattaConnected") as string,
      oldSerialNo: formData.get("oldSerialNo") as string,
      profileImageURL,
    };

    // basic validation for english digits in mobile number
    if (data.mobileNumber && !/^[0-9+\s-]*$/.test(data.mobileNumber)) {
      setError("মোবাইল নম্বর শুধুমাত্র ইংরেজিতে (English digits: 0-9) দিতে হবে।");
      setLoading(false);
      return;
    }

    const result = await submitOnboarding(data, user.uid, user.email);
    if (result && result.success) {
      setSuccess(true);
      onSuccess();
    } else {
      setError(result.error || "তথ্য সংরক্ষণে সমস্যা হয়েছে। (Failed to submit registration)");
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="p-8 text-center space-y-4">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100">
          <CheckCircle className="h-10 w-10 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">নিবন্ধন আবেদন সম্পন্ন হয়েছে!</h2>
        <p className="text-slate-600 max-w-md mx-auto">
          আপনার তথ্য সফলভাবে সংরক্ষিত হয়েছে। একজন এডমিন আপনার আবেদনটি পর্যালোচনা করে অনুমোদন করলেই আপনি ড্যাশবোর্ড দেখতে পাবেন।
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 text-slate-800">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* SECTION 1: Personal Info */}
      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200/80 space-y-6">
        <h3 className="text-lg font-bold text-amber-700 border-b border-slate-200 pb-2">
          ১. ব্যক্তিগত বিবরণী (Personal details)
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  নাম (Name) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="উদা: অরূপ সাহা"
                  className="w-full h-10 px-3.5 border border-slate-300 rounded-lg focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none transition duration-150 text-sm text-slate-800 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  দীক্ষানাম (Initiated Name) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="initiatedName"
                  required
                  placeholder="উদা: অরূপ গোবিন্দ দাস"
                  className="w-full h-10 px-3.5 border border-slate-300 rounded-lg focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none transition duration-150 text-sm text-slate-800 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  জন্ম তারিখ (Date of Birth)
                </label>
                <input
                  type="date"
                  name="dob"
                  className="w-full h-10 px-3.5 border border-slate-300 rounded-lg focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none transition duration-150 text-sm text-slate-800 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  রক্তের গ্রুপ (Blood Group)
                </label>
                <select
                  name="bloodGroup"
                  className="w-full h-10 px-3 border border-slate-300 rounded-lg focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none transition duration-150 text-sm text-slate-800 bg-white cursor-pointer"
                >
                  <option value="">বাছাই করুন (Select)</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  পেশা (Occupation)
                </label>
                <input
                  type="text"
                  name="occupation"
                  placeholder="উদা: শিক্ষকতা / ব্যবসা"
                  className="w-full h-10 px-3.5 border border-slate-300 rounded-lg focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none transition duration-150 text-sm text-slate-800 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  লিঙ্গ (Gender)
                </label>
                <select
                  name="gender"
                  className="w-full h-10 px-3 border border-slate-300 rounded-lg focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none transition duration-150 text-sm text-slate-800 bg-white cursor-pointer"
                >
                  <option value="">বাছাই করুন (Select)</option>
                  <option value="Male">পুরুষ (Male)</option>
                  <option value="Female">নারী (Female)</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  বৈবাহিক অবস্থা (Marital Status)
                </label>
                <select
                  name="maritalStatus"
                  className="w-full h-10 px-3 border border-slate-300 rounded-lg focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none transition duration-150 text-sm text-slate-800 bg-white cursor-pointer"
                >
                  <option value="">বাছাই করুন (Select)</option>
                  <option value="Married">বিবাহিত (Married)</option>
                  <option value="Unmarried">অবিবাহিত (Unmarried)</option>
                  <option value="Other">অন্যান্য (Other)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 flex flex-col justify-start">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5 text-center lg:text-left">
              প্রোফাইল ছবি (Photo)
            </label>
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl p-4 bg-white hover:border-amber-500 hover:bg-amber-50/5 transition shadow-2xs min-h-[220px] h-[calc(100%-2rem)]">
              {photoPreview ? (
                <div className="flex flex-col items-center gap-3 w-full">
                  <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-slate-200 shadow-xs">
                    <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPhotoPreview(null);
                      const fileInput = document.getElementById("profilePhotoInput") as HTMLInputElement;
                      if (fileInput) fileInput.value = "";
                    }}
                    className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-md border border-red-200 transition cursor-pointer"
                  >
                    মুছুন (Remove)
                  </button>
                </div>
              ) : (
                <label htmlFor="profilePhotoInput" className="cursor-pointer text-center space-y-2 w-full py-4 flex flex-col items-center justify-center">
                  <ImageIcon className="w-12 h-12 text-slate-400" />
                  <span className="block text-sm font-semibold text-slate-700">ছবি আপলোড করুন</span>
                  <span className="block text-xs text-slate-500">Upload Profile Photo</span>
                  <span className="mt-2.5 px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-semibold rounded-lg border border-amber-200 transition shadow-2xs">
                    ফাইল নির্বাচন করুন
                  </span>
                </label>
              )}
              <input
                id="profilePhotoInput"
                type="file"
                name="profilePhoto"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Contact Info */}
      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200/80 space-y-6">
        <h3 className="text-lg font-bold text-amber-700 border-b border-slate-200 pb-2">
          ২. যোগাযোগের বিবরণী (Contact details)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              মোবাইল নম্বর (Mobile Number) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="mobileNumber"
              required
              placeholder="উদা: 01712345678"
              className="w-full h-10 px-3.5 border border-slate-300 rounded-lg focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none transition duration-150 text-sm text-slate-800 bg-white"
            />
            <span className="text-xs text-slate-500 mt-1 block">ইংরেজি ডিজিটে দিন (Enter in English digits only)</span>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              WhatsApp নম্বর (WhatsApp Number)
            </label>
            <input
              type="text"
              name="whatsappNumber"
              placeholder="উদা: 01712345678"
              className="w-full h-10 px-3.5 border border-slate-300 rounded-lg focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none transition duration-150 text-sm text-slate-800 bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              বর্তমান ঠিকানা (Present Address)
            </label>
            <textarea
              name="presentAddress"
              rows={3}
              placeholder="গ্রাম, ডাকঘর, থানা, জেলা"
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none transition duration-150 text-sm text-slate-800 bg-white"
            ></textarea>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              স্থায়ী ঠিকানা (Permanent Address)
            </label>
            <textarea
              name="permanentAddress"
              rows={3}
              placeholder="গ্রাম, ডাকঘর, থানা, জেলা"
              className="w-full px-3.5 py-2 border border-slate-300 rounded-lg focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none transition duration-150 text-sm text-slate-800 bg-white"
            ></textarea>
          </div>
        </div>
      </div>

      {/* SECTION 3: Initiation Info */}
      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200/80 space-y-6">
        <h3 className="text-lg font-bold text-amber-700 border-b border-slate-200 pb-2">
          ৩. দীক্ষা সংক্রান্ত বিবরণ (Initiation details)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              ইস্‌কনে যুক্ত হওয়ার তারিখ/সাল (Joined ISKCON Year)
            </label>
            <input
              type="text"
              name="joinedIskconDate"
              placeholder="উদা: 2012"
              className="w-full h-10 px-3.5 border border-slate-300 rounded-lg focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none transition duration-150 text-sm text-slate-800 bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              আশ্রিত তারিখ ও সাল (Sheltered Date)
            </label>
            <input
              type="text"
              name="shelteredDate"
              placeholder="উদা: 2014"
              className="w-full h-10 px-3.5 border border-slate-300 rounded-lg focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none transition duration-150 text-sm text-slate-800 bg-white"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              দীক্ষাগুরুর নাম (Spiritual Master)
            </label>
            <input
              type="text"
              name="spiritualMaster"
              placeholder="উদা: এইচ এইচ জয়পতাকা স্বামী মহারাজ"
              className="w-full h-10 px-3.5 border border-slate-300 rounded-lg focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none transition duration-150 text-sm text-slate-800 bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              হরিনাম দীক্ষা? (Harinam Initiation?)
            </label>
            <select
              name="harinamInitiation"
              className="w-full h-10 px-3 border border-slate-300 rounded-lg focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none transition duration-150 text-sm text-slate-800 bg-white cursor-pointer"
            >
              <option value="না (No)">না (No)</option>
              <option value="হ্যাঁ (Yes)">হ্যাঁ (Yes)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              দীক্ষা তারিখ ও সাল (Initiated Year)
            </label>
            <input
              type="text"
              name="initiatedYear"
              placeholder="উদা: 2016"
              className="w-full h-10 px-3.5 border border-slate-300 rounded-lg focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none transition duration-150 text-sm text-slate-800 bg-white"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              দীক্ষার স্থান (Initiation Place)
            </label>
            <input
              type="text"
              name="initiationPlace"
              placeholder="উদা: শ্রীধাম মায়াপুর"
              className="w-full h-10 px-3.5 border border-slate-300 rounded-lg focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none transition duration-150 text-sm text-slate-800 bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              ব্রাহ্মন দীক্ষা? (Brahman Initiation?)
            </label>
            <select
              name="brahmanInitiation"
              className="w-full h-10 px-3 border border-slate-300 rounded-lg focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none transition duration-150 text-sm text-slate-800 bg-white cursor-pointer"
            >
              <option value="না (No)">না (No)</option>
              <option value="হ্যাঁ (Yes)">হ্যাঁ (Yes)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              ব্রাহ্মন দীক্ষার তারিখ ও সাল (Brahman Date)
            </label>
            <input
              type="text"
              name="brahmanInitiationDate"
              placeholder="উদা: 2018"
              className="w-full h-10 px-3.5 border border-slate-300 rounded-lg focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none transition duration-150 text-sm text-slate-800 bg-white"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              ব্রাহ্মন দীক্ষার স্থান (Brahman Place)
            </label>
            <input
              type="text"
              name="brahmanInitiationPlace"
              placeholder="উদা: শ্রীধাম মায়াপুর"
              className="w-full h-10 px-3.5 border border-slate-300 rounded-lg focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none transition duration-150 text-sm text-slate-800 bg-white"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              কাউন্সিলর বা শিক্ষাগুরুর নাম (Counselor or Siksaguru Name)
            </label>
            <input
              type="text"
              name="counselorName"
              placeholder="উদা: শ্রীমদ ভক্তিপ্রিয় মহাবিষ্ণু স্বামী মহারাজ"
              className="w-full h-10 px-3.5 border border-slate-300 rounded-lg focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none transition duration-150 text-sm text-slate-800 bg-white"
            />
          </div>
        </div>
      </div>

      {/* SECTION 4: Service & Namahatta Info */}
      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200/80 space-y-6">
        <h3 className="text-lg font-bold text-amber-700 border-b border-slate-200 pb-2">
          ৪. সেবা ও সংযোগের বিবরণী (Service & Namahatta connection details)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              কোন বিভাগের সাথে যুক্ত (Connected Department)
            </label>
            <input
              type="text"
              name="department"
              placeholder="উদা: যুব বিভাগ / সংকীর্তন"
              className="w-full h-10 px-3.5 border border-slate-300 rounded-lg focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none transition duration-150 text-sm text-slate-800 bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              সেবা (Service)
            </label>
            <input
              type="text"
              name="service"
              placeholder="উদা: পূজারী সেবা / গ্রন্থ বিতরণ"
              className="w-full h-10 px-3.5 border border-slate-300 rounded-lg focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none transition duration-150 text-sm text-slate-800 bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              নামহট্টের সাথে যুক্ত? (Is Namahatta Connected?)
            </label>
            <select
              name="isNamahattaConnected"
              className="w-full h-10 px-3 border border-slate-300 rounded-lg focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none transition duration-150 text-sm text-slate-800 bg-white cursor-pointer"
            >
              <option value="না (No)">না (No)</option>
              <option value="হ্যাঁ (Yes)">হ্যাঁ (Yes)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              নামহট্টের নাম (Namahatta Name)
            </label>
            <input
              type="text"
              name="namahattaName"
              placeholder="উদা: শিবগঞ্জ নামহট্ট সংঘ"
              className="w-full h-10 px-3.5 border border-slate-300 rounded-lg focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none transition duration-150 text-sm text-slate-800 bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              সাধনা গ্রন্থ (Sadhana Grantha)
            </label>
            <input
              type="text"
              name="sadhanaGrantha"
              placeholder="উদা: ভগবদগীতা যথাযথ"
              className="w-full h-10 px-3.5 border border-slate-300 rounded-lg focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none transition duration-150 text-sm text-slate-800 bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              পুরাতন সিরিয়েল নং (Old Serial No. - if known)
            </label>
            <input
              type="text"
              name="oldSerialNo"
              placeholder="উদা: ১৫২"
              className="w-full h-10 px-3.5 border border-slate-300 rounded-lg focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 focus:outline-none transition duration-150 text-sm text-slate-800 bg-white"
            />
          </div>
        </div>
      </div>

      {/* Form Submission Button */}
      <div className="flex justify-end pt-4 border-t border-slate-200">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-8 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shadow-md transition disabled:bg-slate-300 disabled:cursor-not-allowed cursor-pointer"
        >
          <UserPlus className="w-5 h-5" />
          {loading ? "সংরক্ষণ করা হচ্ছে..." : "আবেদন জমা দিন (Submit Registration)"}
        </button>
      </div>
    </form>
  );
}
