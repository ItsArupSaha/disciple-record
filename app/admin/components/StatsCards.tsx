"use client";

import { UserCheck, Users, ShieldAlert, Award } from "lucide-react";
import { UserProfile } from "../../context/AuthContext";

interface StatsCardsProps {
  users: UserProfile[];
}

export default function StatsCards({ users }: StatsCardsProps) {
  const totalApproved = users.filter((u) => u.isApproved && u.role === "USER").length;
  const totalPending = users.filter((u) => u.role === "PENDING" && !u.isApproved).length;
  const admins = users.filter((u) => u.role === "ADMIN" || u.role === "SUPER_ADMIN").length;
  
  // Calculate some other fun stats
  const maleCount = users.filter((u) => u.isApproved && u.role === "USER" && u.gender?.toLowerCase() === "male").length;
  const femaleCount = users.filter((u) => u.isApproved && u.role === "USER" && u.gender?.toLowerCase() === "female").length;

  const stats = [
    {
      name: "অনুমোদিত ভক্তগণ (Total Approved)",
      value: totalApproved,
      icon: Users,
      color: "bg-blue-500",
      textColor: "text-blue-600",
      description: `${maleCount} পুরুষ ও ${femaleCount} নারী ভক্ত`
    },
    {
      name: "অপেক্ষমান আবেদন (Pending Approvals)",
      value: totalPending,
      icon: ShieldAlert,
      color: "bg-amber-500",
      textColor: "text-amber-600",
      description: "রিভিউ এর জন্য অপেক্ষমান"
    },
    {
      name: "এডমিন সংখ্যা (System Admins)",
      value: admins,
      icon: Award,
      color: "bg-emerald-500",
      textColor: "text-emerald-600",
      description: "সিস্টেম পরিচালনাকারী"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat) => (
        <div key={stat.name} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex items-center gap-5 hover:shadow-md transition duration-200">
          <div className={`p-4 rounded-xl text-white ${stat.color}`}>
            <stat.icon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500">{stat.name}</p>
            <h4 className="text-3xl font-extrabold text-slate-800 mt-1">{stat.value}</h4>
            <p className="text-xs text-slate-400 mt-1">{stat.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
