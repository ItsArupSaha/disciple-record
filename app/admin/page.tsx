"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import Navbar from "../components/Navbar";
import { useAuth, UserProfile } from "../context/AuthContext";
import { 
  getAllUsers, 
  approveUser, 
  deleteUser, 
  findMatchingRecord, 
  mergeUser, 
  updateUserAction 
} from "../actions/adminActions";

// Modular Subcomponents
import StatsCards from "./components/StatsCards";
import ApprovedList from "./components/ApprovedList";
import PendingList from "./components/PendingList";
import DetailsModal from "./components/DetailsModal";
import EditModal from "./components/EditModal";
import MatchModal from "./components/MatchModal";
import PasswordModal from "./components/PasswordModal";

export default function AdminPage() {
  const { userProfile } = useAuth();
  
  // Data States
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"approved" | "pending">("approved");

  // Modal Control States
  const [selectedUserForDetails, setSelectedUserForDetails] = useState<UserProfile | null>(null);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<UserProfile | null>(null);
  const [selectedUserForDeleteId, setSelectedUserForDeleteId] = useState<string | null>(null);
  
  // Merge Matching States
  const [selectedPendingUser, setSelectedPendingUser] = useState<UserProfile | null>(null);
  const [matchingOfflineCandidates, setMatchingOfflineCandidates] = useState<any[]>([]);

  const isSuperAdmin = userProfile?.role === "SUPER_ADMIN";
  const applyAntiCopy = !isSuperAdmin;

  const loadUsers = async () => {
    setLoading(true);
    if (userProfile?.email) {
      const res = await getAllUsers(userProfile.email);
      if (res.success && res.data) {
        setUsers(res.data as unknown as UserProfile[]);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, [userProfile]);

  // Approval Process (with Merge Checks)
  const handleApproveClick = async (pendingUser: UserProfile) => {
    if (!userProfile?.email) return;

    if (!pendingUser.initiatedName) {
      // If no initiated name is present, approve directly
      await executeDirectApproval(pendingUser.uid);
      return;
    }

    setLoading(true);
    const res = await findMatchingRecord(pendingUser.initiatedName, userProfile.email);
    setLoading(false);

    if (res.success && res.data) {
      // Find candidate offline profiles (profiles imported via Excel that do not have a uid or email linked yet)
      const offlineCandidates = (res.data as any[]).filter(
        (candidate) => candidate.id !== pendingUser.uid && (!candidate.email || candidate.email === "")
      );

      if (offlineCandidates.length > 0) {
        setMatchingOfflineCandidates(offlineCandidates);
        setSelectedPendingUser(pendingUser);
      } else {
        await executeDirectApproval(pendingUser.uid);
      }
    } else {
      await executeDirectApproval(pendingUser.uid);
    }
  };

  const executeDirectApproval = async (uid: string) => {
    if (!userProfile?.email) return;
    if (confirm("আপনি কি মার্জ না করেই এই শিষ্যকে সরাসরি অনুমোদন করতে চান? (Confirm direct approval?)")) {
      setLoading(true);
      const res = await approveUser(uid, userProfile.email);
      setLoading(false);
      if (res.success) {
        alert("শিষ্য সফলভাবে অনুমোদিত হয়েছে! (User approved!)");
        loadUsers();
      } else {
        alert(res.error || "অনুমোদন ব্যর্থ হয়েছে। (Approval failed)");
      }
    }
  };

  // Merge & Approve Action
  const handleMergeSubmit = async (offlineId: string, keepOfflineMobile: boolean) => {
    if (!userProfile?.email || !selectedPendingUser) return;
    
    setLoading(true);
    const res = await mergeUser(selectedPendingUser.uid, offlineId, userProfile.email, keepOfflineMobile);
    setLoading(false);

    if (res.success) {
      alert("রেকর্ড সফলভাবে মার্জ এবং অনুমোদিত হয়েছে! (Merged & approved successfully!)");
      setSelectedPendingUser(null);
      setMatchingOfflineCandidates([]);
      loadUsers();
    } else {
      alert(res.error || "মার্জ করতে ব্যর্থ হয়েছে। (Merge failed)");
    }
  };

  // Delete Action
  const handleDeleteClick = (uid: string) => {
    if (!isSuperAdmin) {
      alert("শুধুমাত্র সুপার এডমিন এই কাজটি করতে পারেন। (Super Admin action only)");
      return;
    }
    setSelectedUserForDeleteId(uid);
  };

  const executeDelete = async (passwordInput: string) => {
    if (!userProfile?.email || !selectedUserForDeleteId) return;

    const res = await deleteUser(selectedUserForDeleteId, passwordInput, userProfile.email);
    if (res.success) {
      alert("রেকর্ডটি সফলভাবে মুছে ফেলা হয়েছে।");
      setSelectedUserForDeleteId(null);
      loadUsers();
    } else {
      throw new Error(res.error || "ডিলেট ব্যর্থ হয়েছে। পাসওয়ার্ডটি পুনরায় পরীক্ষা করুন।");
    }
  };

  // Edit Action
  const handleEditSave = async (updatedData: any, passwordInput: string): Promise<boolean> => {
    if (!userProfile?.email || !selectedUserForEdit) return false;

    const res = await updateUserAction(selectedUserForEdit.uid, updatedData, passwordInput, userProfile.email);
    if (res.success) {
      alert("তথ্য সফলভাবে হালনাগাদ করা হয়েছে! (Updated successfully!)");
      loadUsers();
      return true;
    }
    return false;
  };

  // Separate Users
  const pendingUsers = users.filter((u) => u.role === "PENDING" && !u.isApproved);
  const approvedUsers = users.filter((u) => u.isApproved && u.role === "USER");

  return (
    <ProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
      <div 
        className={`min-h-screen bg-slate-100 font-sans ${applyAntiCopy ? "select-none" : ""}`}
        onContextMenu={e => { if(applyAntiCopy) e.preventDefault(); }}
        onDragStart={e => { if(applyAntiCopy) e.preventDefault(); }}
      >
        <Navbar />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-5">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                {isSuperAdmin ? "সুপার এডমিন ড্যাশবোর্ড (Super Admin)" : "এডমিন ড্যাশবোর্ড (Admin Dashboard)"}
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                দীক্ষাপ্রাপ্ত শিষ্যদের তথ্য পরিচালনা এবং অনুমোদন প্যানেল
              </p>
            </div>
          </div>

          {/* Stats Summary */}
          {loading && users.length === 0 ? (
            <div className="h-32 bg-white rounded-2xl border border-slate-200 flex items-center justify-center text-slate-500 font-semibold animate-pulse">
              পরিসংখ্যান লোড হচ্ছে... (Loading stats...)
            </div>
          ) : (
            <StatsCards users={users} />
          )}

          {/* Tabs Navigation */}
          <div className="flex border-b border-slate-200 bg-white p-1.5 rounded-xl border max-w-md shadow-xs">
            <button
              onClick={() => setActiveTab("approved")}
              className={`flex-1 py-2 px-4 rounded-lg font-bold text-center text-sm transition duration-200 ${
                activeTab === "approved"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              অনুমোদিত শিষ্য তালিকা ({approvedUsers.length})
            </button>
            <button
              onClick={() => setActiveTab("pending")}
              className={`flex-1 py-2 px-4 rounded-lg font-bold text-center text-sm transition duration-200 ${
                activeTab === "pending"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              অপেক্ষমান আবেদন ({pendingUsers.length})
            </button>
          </div>

          {/* Main Content Area */}
          {loading && users.length === 0 ? (
            <div className="h-64 bg-white rounded-2xl border border-slate-200 flex items-center justify-center text-slate-500 font-semibold animate-pulse">
              ডাটা লোড হচ্ছে... (Loading Disciple Archive...)
            </div>
          ) : (
            <div>
              {activeTab === "approved" ? (
                <ApprovedList
                  approvedUsers={approvedUsers}
                  adminEmail={userProfile?.email || ""}
                  isSuperAdmin={isSuperAdmin}
                  onViewDetails={setSelectedUserForDetails}
                  onEdit={setSelectedUserForEdit}
                  onDelete={handleDeleteClick}
                  onRefresh={loadUsers}
                />
              ) : (
                <PendingList
                  pendingUsers={pendingUsers}
                  isSuperAdmin={isSuperAdmin}
                  onViewDetails={setSelectedUserForDetails}
                  onApprove={handleApproveClick}
                  onDelete={handleDeleteClick}
                />
              )}
            </div>
          )}

        </div>

        {/* MODAL 1: View Details */}
        {selectedUserForDetails && (
          <DetailsModal
            user={selectedUserForDetails}
            onClose={() => setSelectedUserForDetails(null)}
          />
        )}

        {/* MODAL 2: Edit Disciple (Super Admin Only) */}
        {selectedUserForEdit && (
          <EditModal
            user={selectedUserForEdit}
            onClose={() => setSelectedUserForEdit(null)}
            onSave={handleEditSave}
          />
        )}

        {/* MODAL 3: Merge candidate modal */}
        {selectedPendingUser && matchingOfflineCandidates.length > 0 && (
          <MatchModal
            pendingUser={selectedPendingUser}
            matches={matchingOfflineCandidates}
            onClose={() => {
              setSelectedPendingUser(null);
              setMatchingOfflineCandidates([]);
            }}
            onMerge={handleMergeSubmit}
            onApproveAsNew={async () => {
              const uid = selectedPendingUser.uid;
              setSelectedPendingUser(null);
              setMatchingOfflineCandidates([]);
              await executeDirectApproval(uid);
            }}
          />
        )}

        {/* MODAL 4: Secure Action password prompt */}
        {selectedUserForDeleteId && (
          <PasswordModal
            title="সতর্কতা: রেকর্ড মুছে ফেলা হচ্ছে (Delete Record Confirmation)"
            description="আপনি কি নিশ্চিত যে আপনি শিষ্য রেকর্ডটি চিরতরে মুছে ফেলতে চান? এটি নিশ্চিত করতে সুপার এডমিন পাসওয়ার্ড প্রদান করুন।"
            onClose={() => setSelectedUserForDeleteId(null)}
            onConfirm={executeDelete}
          />
        )}

      </div>
    </ProtectedRoute>
  );
}
