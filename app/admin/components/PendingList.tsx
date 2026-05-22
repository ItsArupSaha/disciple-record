"use client";

import { useState } from "react";
import { UserCheck, Trash2, Eye, ShieldAlert } from "lucide-react";
import { UserProfile } from "../../context/AuthContext";

interface PendingListProps {
  pendingUsers: UserProfile[];
  isSuperAdmin: boolean;
  onViewDetails: (user: UserProfile) => void;
  onApprove: (user: UserProfile) => void;
  onDelete: (uid: string) => void;
}

export default function PendingList({
  pendingUsers,
  isSuperAdmin,
  onViewDetails,
  onApprove,
  onDelete,
}: PendingListProps) {
  if (pendingUsers.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-10 border border-slate-200 text-center text-slate-500 shadow-sm space-y-3">
        <ShieldAlert className="w-12 h-12 text-slate-300 mx-auto" />
        <p className="text-lg font-semibold text-slate-700">কোনো অপেক্ষমান অনুমোদন নেই।</p>
        <p className="text-sm text-slate-400">All registration requests have been processed.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <h3 className="text-lg font-bold text-slate-800">অপেক্ষমান অনুমোদন (Pending Approvals)</h3>
        <p className="text-xs text-slate-400 mt-1">ভক্তদের নতুন নিবন্ধনের আবেদনসমূহ পর্যালোচনা করুন</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-slate-800">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <th className="py-4 px-6">নাম (Name)</th>
              <th className="py-4 px-6">দীক্ষানাম (Initiated Name)</th>
              <th className="py-4 px-6">মোবাইল নম্বর (Mobile)</th>
              <th className="py-4 px-6">দীক্ষাগুরু (Spiritual Master)</th>
              <th className="py-4 px-6 text-center">পদক্ষেপ (Actions)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {pendingUsers.map((u) => (
              <tr key={u.uid} className="hover:bg-slate-50 transition duration-150">
                <td className="py-4 px-6 font-semibold text-slate-900">{u.name}</td>
                <td className="py-4 px-6 font-medium text-slate-700">{u.initiatedName || "—"}</td>
                <td className="py-4 px-6 text-slate-650">{u.mobileNumber}</td>
                <td className="py-4 px-6 text-slate-650">{u.spiritualMaster || "—"}</td>
                <td className="py-4 px-6">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => onViewDetails(u)}
                      className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-650 rounded-lg transition"
                      title="বিস্তারিত দেখুন"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onApprove(u)}
                      className="flex items-center gap-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs shadow-sm transition"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      অনুমোদন করুন (Review/Approve)
                    </button>
                    {isSuperAdmin && (
                      <button
                        onClick={() => onDelete(u.uid)}
                        className="p-2 bg-red-50 hover:bg-red-100 text-red-650 rounded-lg transition"
                        title="বাতিল/মুছুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
