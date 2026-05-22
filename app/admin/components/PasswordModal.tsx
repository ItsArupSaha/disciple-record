"use client";

import { useState } from "react";
import { X, ShieldAlert } from "lucide-react";

interface PasswordModalProps {
  title: string;
  description: string;
  onClose: () => void;
  onConfirm: (password: string) => Promise<void>;
}

export default function PasswordModal({ title, description, onClose, onConfirm }: PasswordModalProps) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError("পাসওয়ার্ড আবশ্যক। (Password is required)");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await onConfirm(password);
    } catch (err: any) {
      setError(err.message || "পাসওয়ার্ড সঠিক নয়। (Incorrect Password)");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3 text-red-600">
            <ShieldAlert className="w-6 h-6 shrink-0" />
            <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full transition text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="mt-3 text-sm text-slate-600 leading-relaxed">{description}</p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">
              সুপার এডমিন পাসওয়ার্ড (Super Admin Password)
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="পাসওয়ার্ড লিখুন..."
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition text-slate-800 bg-white"
            />
          </div>

          {error && <p className="text-xs font-semibold text-red-600">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-sm transition"
            >
              বাতিল (Cancel)
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg text-sm shadow transition disabled:bg-slate-300"
            >
              {loading ? "যাচাই করা হচ্ছে..." : "নিশ্চিত করুন (Confirm)"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
