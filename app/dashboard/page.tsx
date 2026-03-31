"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { createAnnouncement, getAnnouncements } from "../actions/announcementActions";
import styles from "./page.module.css";

interface Announcement {
  id: string;
  title: string;
  message: string;
  createdBy: string;
  createdAt: string;
}

export default function DashboardPage() {
  const { user, userProfile } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const loadAnnouncements = async () => {
    setLoading(true);
    const result = await getAnnouncements();
    if (result.success && result.data) {
      setAnnouncements(result.data as Announcement[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || userProfile?.role !== "SUPER_ADMIN" || !user.email) return;

    setCreating(true);
    const res = await createAnnouncement(title, message, userProfile.name || "Super Admin", user.email);
    if (res.success) {
      setTitle("");
      setMessage("");
      loadAnnouncements();
    } else {
      alert(res.error || "Failed to create announcement");
    }
    setCreating(false);
  };

  return (
    <ProtectedRoute allowedRoles={["USER", "ADMIN", "SUPER_ADMIN"]}>
      <div className={styles.container}>
        <Navbar />
        
        <main className={styles.main}>
          <div className={styles.header}>
            <h1 className={styles.title}>Hare Krishna, {userProfile?.name}</h1>
            <p style={{ color: "#64748b" }}>স্বাগতম আপনাকে ডিজিটাল আর্কাইভে। (Welcome to the Digital Archive)</p>
          </div>

          {userProfile?.role === "SUPER_ADMIN" && (
            <div className={styles.createBox}>
              <h2 className={styles.announcementsTitle}>নতুন বিজ্ঞপ্তি দিন (Create Announcement)</h2>
              <form onSubmit={handleCreate}>
                <input
                  type="text"
                  placeholder="শিরোনাম (Title)"
                  className={styles.createInput}
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                />
                <textarea
                  placeholder="বিস্তারিত বার্তা... (Message Details...)"
                  className={styles.createTextarea}
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  required
                />
                <button type="submit" disabled={creating} className={styles.submitBtn}>
                  {creating ? "Publishing..." : "বিজ্ঞপ্তি প্রকাশ করুন (Publish)"}
                </button>
              </form>
            </div>
          )}

          <div className={styles.announcementsBox}>
            <h2 className={styles.announcementsTitle}>বিজ্ঞপ্তি সমূহ (Announcements)</h2>
            
            {loading ? (
              <p style={{ textAlign: "center", color: "#64748b" }}>লোড হচ্ছে... (Loading...)</p>
            ) : announcements.length === 0 ? (
              <p className={styles.noAnnouncements}>কোনো নতুন বিজ্ঞপ্তি নেই। (No announcements yet.)</p>
            ) : (
              announcements.map((a) => (
                <div key={a.id} className={styles.announcementCard}>
                  <h3>{a.title}</h3>
                  <div className={styles.announcementMeta}>
                    <span>{new Date(a.createdAt).toLocaleString()}</span>
                    <span> | Published by: {a.createdBy}</span>
                  </div>
                  <div className={styles.announcementBody}>{a.message}</div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
