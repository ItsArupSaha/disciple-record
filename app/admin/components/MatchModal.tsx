"use client";

import { X, GitMerge, Check } from "lucide-react";
import { UserProfile } from "../../context/AuthContext";

interface MatchModalProps {
  pendingUser: UserProfile;
  matches: any[];
  onClose: () => void;
  onMerge: (offlineId: string, keepOfflineMobile: boolean) => Promise<void>;
  onApproveAsNew: () => Promise<void>;
}

export default function MatchModal({ pendingUser, matches, onClose, onMerge, onApproveAsNew }: MatchModalProps) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col p-6 animate-in fade-in zoom-in-95 duration-200 text-slate-800">
        
        {/* Header */}
        <div className="flex justify-between items-start pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5 text-amber-700">
            <GitMerge className="w-6 h-6" />
            <h3 className="text-lg font-bold">মিল পাওয়া গেছে! (Match Found)</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full transition text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-4 space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">
            দীক্ষানাম <strong className="text-slate-850 font-bold">"{pendingUser.initiatedName}"</strong> এর সাথে ম্যাচ করে এমন অফলাইন রেকর্ড সিস্টেমে পাওয়া গেছে। আপনি কি নতুন অনুরোধটি এই অফলাইন রেকর্ডের সাথে মার্জ করতে চান?
          </p>

          <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-1">
            {matches.map((m) => (
              <div key={m.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="text-sm space-y-1">
                  <p className="font-semibold text-slate-800">নাম: {m.name}</p>
                  <p className="text-slate-600">মোবাইল: {m.mobileNumber}</p>
                  <p className="text-slate-600">ঠিকানা: {m.presentAddress || "N/A"}</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => onMerge(m.id, true)}
                    className="flex-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition text-center"
                  >
                    মার্জ করুন (মোবাইল নম্বর অফলাইনেরটি রাখুন)
                  </button>
                  <button
                    onClick={() => onMerge(m.id, false)}
                    className="flex-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-sm transition text-center"
                  >
                    মার্জ করুন (মোবাইল নম্বর নতুনেরটি রাখুন)
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t border-slate-100 mt-5">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-sm transition"
          >
            বাতিল (Cancel)
          </button>
          <button
            onClick={onApproveAsNew}
            className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg text-sm shadow transition"
          >
            <Check className="w-4 h-4" />
            মার্জ না করে নতুন রেকর্ড হিসেবে অনুমোদন করুন
          </button>
        </div>

      </div>
    </div>
  );
}
