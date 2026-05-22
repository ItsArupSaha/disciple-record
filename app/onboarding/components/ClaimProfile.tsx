"use client";

import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { findOfflineProfile, claimProfile } from "../../actions/userActions";
import { Search, Phone, UserCheck, AlertCircle, CheckCircle } from "lucide-react";

interface ClaimProfileProps {
  onSuccess: () => void;
}

export default function ClaimProfile({ onSuccess }: ClaimProfileProps) {
  const { user } = useAuth();
  
  // Search states
  const [searchInitiated, setSearchInitiated] = useState("");
  const [searchMobile, setSearchMobile] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [claimLoadingId, setClaimLoadingId] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInitiated.trim() && !searchMobile.trim()) {
      setSearchError("দীক্ষানাম অথবা মোবাইল নম্বর দিন। (Please enter Initiated Name or Mobile Number)");
      return;
    }
    setSearchLoading(true);
    setSearchError("");
    setSearchResults([]);
    setHasSearched(false);

    const res = await findOfflineProfile(searchInitiated, searchMobile);
    setSearchLoading(false);
    if (res.success && res.data) {
      setSearchResults(res.data);
      setHasSearched(true);
    } else {
      setSearchError(res.error || "অনুসন্ধান ব্যর্থ হয়েছে। (Search failed)");
    }
  };

  const handleClaim = async (offlineId: string) => {
    if (!user) return;
    if (!confirm("আপনি কি নিশ্চিত যে এটি আপনার রেকর্ড এবং আপনি এটি দাবি করতে চান? (Are you sure you want to claim this profile?)")) return;

    setClaimLoadingId(offlineId);
    setSearchError("");

    const res = await claimProfile(offlineId, user.uid, user.email);
    if (res.success) {
      alert("প্রোফাইলটি সফলভাবে যুক্ত হয়েছে! (Profile successfully claimed!)");
      onSuccess();
    } else {
      setSearchError(res.error || "দাবি করতে ব্যর্থ হয়েছে। (Claim failed)");
      setClaimLoadingId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="bg-amber-50 border-l-4 border-amber-500 p-3.5 rounded-r-lg">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 mr-2.5 shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-amber-800">পূর্বের আমদানীকৃত রেকর্ড দাবি করুন (Claim Existing Profile)</h3>
            <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
              যদি আপনার তথ্য ইতিপূর্বে এক্সেল শিট এর মাধ্যমে সিস্টেমে যুক্ত হয়ে থাকে, তবে আপনার দীক্ষানাম এবং মোবাইল নম্বর দিয়ে অনুসন্ধান করে দাবি করুন। এতে আপনার পূর্বের রেকর্ডটির সাথে আপনার গুগল অ্যাকাউন্ট সংযুক্ত হয়ে যাবে।
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSearch} className="space-y-4 bg-slate-50 p-5 rounded-xl border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              দীক্ষানাম (Initiated Name)
            </label>
            <input
              type="text"
              value={searchInitiated}
              onChange={(e) => setSearchInitiated(e.target.value)}
              placeholder="উদা: নিরুপমা জাম্বুবতী দেবী দসী"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition text-sm text-slate-800 bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              মোবাইল নম্বর (Mobile Number)
            </label>
            <input
              type="text"
              value={searchMobile}
              onChange={(e) => setSearchMobile(e.target.value)}
              placeholder="উদা: 01853XXXXXX"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition text-sm text-slate-800 bg-white"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={searchLoading}
            className="flex items-center gap-1.5 px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg shadow-sm transition disabled:bg-slate-300 disabled:cursor-not-allowed"
          >
            <Search className="w-4 h-4" />
            {searchLoading ? "অনুসন্ধান করা হচ্ছে..." : "অনুসন্ধান করুন (Search)"}
          </button>
        </div>
      </form>

      {searchError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
          <span className="text-sm font-medium">{searchError}</span>
        </div>
      )}

      {hasSearched && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-800">অনুসন্ধানের ফলাফল (Search Results)</h3>
          {searchResults.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-xl text-slate-500">
              কোনো রেকর্ড পাওয়া যায়নি। আপনার তথ্য না পাওয়া গেলে পাশে "নতুন নিবন্ধন" ট্যাবে গিয়ে ফরম পূরণ করুন।
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {searchResults.map((profile) => (
                <div 
                  key={profile.id} 
                  className="p-5 bg-white border border-slate-200 hover:border-amber-500 rounded-xl shadow-sm transition flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-slate-800">
                        {profile.initiatedName || "দীক্ষানাম নেই"}
                      </span>
                      {profile.serialNo && (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-xs font-semibold rounded">
                          SL: {profile.serialNo}
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 text-sm text-slate-600">
                      <div><span className="font-semibold">নাম (Name):</span> {profile.name}</div>
                      <div><span className="font-semibold">মোবাইল (Mobile):</span> {profile.mobileNumber}</div>
                      <div className="md:col-span-2"><span className="font-semibold">ঠিকানা (Address):</span> {profile.presentAddress || profile.permanentAddress || "N/A"}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleClaim(profile.id)}
                    disabled={claimLoadingId === profile.id}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition text-sm shadow-sm shrink-0 disabled:bg-slate-300 disabled:cursor-not-allowed"
                  >
                    <UserCheck className="w-4 h-4" />
                    {claimLoadingId === profile.id ? "যুক্ত হচ্ছে..." : "দাবি করুন (Claim Profile)"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
