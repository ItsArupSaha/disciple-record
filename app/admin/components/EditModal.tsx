"use client";

import { useState } from "react";
import { X, Save, AlertCircle } from "lucide-react";
import { UserProfile } from "../../context/AuthContext";

interface EditModalProps {
  user: UserProfile;
  onClose: () => void;
  onSave: (updatedData: any, passwordInput: string) => Promise<boolean>;
}

export default function EditModal({ user, onClose, onSave }: EditModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!password) {
      setError("সুপার এডমিন পাসওয়ার্ড আবশ্যক। (Super admin password is required)");
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const updatedData = {
      name: formData.get("name") as string,
      initiatedName: formData.get("initiatedName") as string,
      dob: formData.get("dob") as string,
      gender: formData.get("gender") as string,
      bloodGroup: formData.get("bloodGroup") as string,
      maritalStatus: formData.get("maritalStatus") as string,
      occupation: formData.get("occupation") as string,
      mobileNumber: formData.get("mobileNumber") as string,
      whatsappNumber: formData.get("whatsappNumber") as string,
      presentAddress: formData.get("presentAddress") as string,
      permanentAddress: formData.get("permanentAddress") as string,
      joinedIskconDate: formData.get("joinedIskconDate") as string,
      shelteredDate: formData.get("shelteredDate") as string,
      spiritualMaster: formData.get("spiritualMaster") as string,
      harinamInitiation: formData.get("harinamInitiation") as string,
      initiatedYear: formData.get("initiatedYear") as string,
      initiationPlace: formData.get("initiationPlace") as string,
      brahmanInitiation: formData.get("brahmanInitiation") as string,
      brahmanInitiationDate: formData.get("brahmanInitiationDate") as string,
      brahmanInitiationPlace: formData.get("brahmanInitiationPlace") as string,
      counselorName: formData.get("counselorName") as string,
      department: formData.get("department") as string,
      service: formData.get("service") as string,
      sadhanaGrantha: formData.get("sadhanaGrantha") as string,
      isNamahattaConnected: formData.get("isNamahattaConnected") as string,
      namahattaName: formData.get("namahattaName") as string,
      serialNo: formData.get("serialNo") as string,
      oldSerialNo: formData.get("oldSerialNo") as string,
    };

    const success = await onSave(updatedData, password);
    setLoading(false);
    if (success) {
      onClose();
    } else {
      setError("তথ্য হালনাগাদ করতে ব্যর্থ হয়েছে। পাসওয়ার্ড সঠিক কি না পরীক্ষা করুন। (Failed to update. Verify password.)");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-orange-500 p-6 text-white flex justify-between items-center shrink-0">
          <div>
            <h3 className="text-xl font-bold">শিষ্য তথ্য সম্পাদনা (Edit Disciple Details)</h3>
            <p className="text-amber-100 text-sm">{user.name} ({user.initiatedName})</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto bg-slate-50 space-y-6 flex-1 text-slate-800">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
                <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            {/* Grid Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Section 1: Personal Details */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
                <h4 className="text-amber-700 font-bold border-b border-slate-100 pb-2">১. ব্যক্তিগত বিবরণী (Personal Info)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">নাম (Name)</label>
                    <input type="text" name="name" defaultValue={user.name} required className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500 outline-none transition text-sm bg-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">দীক্ষানাম (Initiated Name)</label>
                    <input type="text" name="initiatedName" defaultValue={user.initiatedName} required className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500 outline-none transition text-sm bg-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">জন্ম তারিখ (DOB)</label>
                    <input type="date" name="dob" defaultValue={user.dob} className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500 outline-none transition text-sm bg-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">লিঙ্গ (Gender)</label>
                    <select name="gender" defaultValue={user.gender} className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500 outline-none transition text-sm bg-white">
                      <option value="">বাছাই করুন (Select)</option>
                      <option value="Male">পুরুষ (Male)</option>
                      <option value="Female">নারী (Female)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">রক্তের গ্রুপ (Blood Group)</label>
                    <select name="bloodGroup" defaultValue={user.bloodGroup} className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500 outline-none transition text-sm bg-white">
                      <option value="">বাছাই করুন</option>
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
                    <label className="block text-xs font-semibold text-slate-500 mb-1">বৈবাহিক অবস্থা (Marital Status)</label>
                    <select name="maritalStatus" defaultValue={user.maritalStatus} className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500 outline-none transition text-sm bg-white">
                      <option value="">বাছাই করুন</option>
                      <option value="Married">Married</option>
                      <option value="Unmarried">Unmarried</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">পেশা (Occupation)</label>
                    <input type="text" name="occupation" defaultValue={user.occupation} className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500 outline-none transition text-sm bg-white" />
                  </div>
                </div>
              </div>

              {/* Section 2: Contact Info */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
                <h4 className="text-amber-700 font-bold border-b border-slate-100 pb-2">২. যোগাযোগের বিবরণী (Contact Info)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">মোবাইল নম্বর (Mobile)</label>
                    <input type="text" name="mobileNumber" defaultValue={user.mobileNumber} required className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500 outline-none transition text-sm bg-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">WhatsApp নম্বর</label>
                    <input type="text" name="whatsappNumber" defaultValue={user.whatsappNumber} className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500 outline-none transition text-sm bg-white" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">বর্তমান ঠিকানা (Present Address)</label>
                    <textarea name="presentAddress" defaultValue={user.presentAddress} rows={2} className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500 outline-none transition text-sm bg-white" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">স্থায়ী ঠিকানা (Permanent Address)</label>
                    <textarea name="permanentAddress" defaultValue={user.permanentAddress} rows={2} className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500 outline-none transition text-sm bg-white" />
                  </div>
                </div>
              </div>

              {/* Section 3: Initiation Info */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4 md:col-span-2">
                <h4 className="text-amber-700 font-bold border-b border-slate-100 pb-2">৩. দীক্ষা সংক্রান্ত বিবরণী (Initiation Info)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">দীক্ষাগুরু (Spiritual Master)</label>
                    <input type="text" name="spiritualMaster" defaultValue={user.spiritualMaster} className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500 outline-none transition text-sm bg-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">হরিনাম দীক্ষা (Harinam)</label>
                    <select name="harinamInitiation" defaultValue={user.harinamInitiation} className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500 outline-none transition text-sm bg-white">
                      <option value="হ্যাঁ (Yes)">হ্যাঁ (Yes)</option>
                      <option value="না (No)">না (No)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">দীক্ষা সাল (Initiated Year)</label>
                    <input type="text" name="initiatedYear" defaultValue={user.initiatedYear} className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500 outline-none transition text-sm bg-white" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">দীক্ষার স্থান (Initiation Place)</label>
                    <input type="text" name="initiationPlace" defaultValue={user.initiationPlace} className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500 outline-none transition text-sm bg-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">ব্রাহ্মন দীক্ষা (Brahman)</label>
                    <select name="brahmanInitiation" defaultValue={user.brahmanInitiation} className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500 outline-none transition text-sm bg-white">
                      <option value="না (No)">না (No)</option>
                      <option value="হ্যাঁ (Yes)">হ্যাঁ (Yes)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">ব্রাহ্মন দীক্ষা সাল (Brahman Year)</label>
                    <input type="text" name="brahmanInitiationDate" defaultValue={user.brahmanInitiationDate} className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500 outline-none transition text-sm bg-white" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">ব্রাহ্মন দীক্ষার স্থান (Brahman Place)</label>
                    <input type="text" name="brahmanInitiationPlace" defaultValue={user.brahmanInitiationPlace} className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500 outline-none transition text-sm bg-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">আশ্রিত তারিখ (Shelter Date)</label>
                    <input type="text" name="shelteredDate" defaultValue={user.shelteredDate} className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500 outline-none transition text-sm bg-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">ইস্‌কনে যুক্ত হওয়ার সাল (Joined ISKCON)</label>
                    <input type="text" name="joinedIskconDate" defaultValue={user.joinedIskconDate} className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500 outline-none transition text-sm bg-white" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">কাউন্সিলর/শিক্ষাগুরুর নাম (Counselor)</label>
                    <input type="text" name="counselorName" defaultValue={user.counselorName} className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500 outline-none transition text-sm bg-white" />
                  </div>
                </div>
              </div>

              {/* Section 4: Service & Connection */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4 md:col-span-2">
                <h4 className="text-amber-700 font-bold border-b border-slate-100 pb-2">৪. সেবা ও সংযোগ (Service & Connection)</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">কোন বিভাগের সাথে যুক্ত (Dept)</label>
                    <input type="text" name="department" defaultValue={user.department} className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500 outline-none transition text-sm bg-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">সেবা (Service)</label>
                    <input type="text" name="service" defaultValue={user.service} className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500 outline-none transition text-sm bg-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">সাধনা গ্রন্থ (Sadhana Grantha)</label>
                    <input type="text" name="sadhanaGrantha" defaultValue={user.sadhanaGrantha} className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500 outline-none transition text-sm bg-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">নামহট্টের সাথে যুক্ত? (Is Namahatta)</label>
                    <select name="isNamahattaConnected" defaultValue={user.isNamahattaConnected} className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500 outline-none transition text-sm bg-white">
                      <option value="না (No)">না (No)</option>
                      <option value="হ্যাঁ (Yes)">হ্যাঁ (Yes)</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">নামহট্টের নাম (Namahatta Name)</label>
                    <input type="text" name="namahattaName" defaultValue={user.namahattaName} className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500 outline-none transition text-sm bg-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">সিরিয়েল নং (Serial No)</label>
                    <input type="text" name="serialNo" defaultValue={user.serialNo} className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500 outline-none transition text-sm bg-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">পুরাতন সিরিয়েল নং (Old Serial No)</label>
                    <input type="text" name="oldSerialNo" defaultValue={user.oldSerialNo} className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500 outline-none transition text-sm bg-white" />
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Footer with Super Admin confirmation password */}
          <div className="bg-slate-100 border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="text-xs font-bold text-red-600 shrink-0">পাসওয়ার্ড নিশ্চিতকরণ (Confirm Password):</span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="সুপার এডমিন পাসওয়ার্ড..."
                className="w-full sm:w-48 px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-red-500 outline-none transition text-sm bg-white"
              />
            </div>
            <div className="flex gap-3 w-full sm:w-auto justify-end">
              <button type="button" onClick={onClose} className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg transition text-sm">
                বাতিল (Cancel)
              </button>
              <button type="submit" disabled={loading} className="flex items-center gap-1.5 px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg shadow transition text-sm disabled:bg-slate-300">
                <Save className="w-4 h-4" />
                {loading ? "সংরক্ষণ করা হচ্ছে..." : "সংরক্ষণ করুন (Save)"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
