"use client";

import { useEffect, useState, useRef } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

import ProtectedRoute from "../components/ProtectedRoute";
import Navbar from "../components/Navbar";
import { useAuth, UserProfile } from "../context/AuthContext";
import { getAllUsers, approveUser, deleteUser, findMatchingRecord, mergeUser, importDisciplesAction, updateUserAction } from "../actions/adminActions";
import { normalizeNumbers } from "../lib/utils";
import styles from "./page.module.css";

interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => void;
}

export default function AdminPage() {
  const { userProfile } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"pending" | "approved" | "import">("pending");

  const [searchYear, setSearchYear] = useState("");
  const [searchDistrict, setSearchDistrict] = useState("");
  
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [targetActionId, setTargetActionId] = useState<string | null>(null);

  // Edit states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  // Matching states
  const [matchingUsers, setMatchingUsers] = useState<any[]>([]);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [selectedPendingUser, setSelectedPendingUser] = useState<UserProfile | null>(null);

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

  const handleApprove = async (uid: string) => {
    if (!userProfile?.email) return;
    if (confirm("Are you sure you want to approve this user directly?")) {
      const res = await approveUser(uid, userProfile.email);
      if (res.success) {
        alert("User approved!");
        loadUsers();
      } else {
        alert(res.error || "Approval failed");
      }
    }
  };

  const handleFindMatches = async (user: UserProfile) => {
    if (!userProfile?.email || !user.initiatedName) return;
    const res = await findMatchingRecord(user.initiatedName, userProfile.email);
    if (res.success && res.data) {
      // Filter out self and only show OFFLINE records (those that might not have a uid or email yet)
      const offlineCandidates = (res.data as any[]).filter(d => d.id !== user.uid && (!d.email || d.email === ""));
      if (offlineCandidates.length > 0) {
        setMatchingUsers(offlineCandidates);
        setSelectedPendingUser(user);
        setShowMatchModal(true);
      } else {
        alert("No matching offline records found for this Initiated Name.");
        handleApprove(user.uid);
      }
    }
  };

  const handleMerge = async (offlineId: string, keepMobile: boolean) => {
    if (!userProfile?.email || !selectedPendingUser) return;
    const res = await mergeUser(selectedPendingUser.uid, offlineId, userProfile.email, keepMobile);
    if (res.success) {
      alert("Records merged & user approved successfully!");
      setShowMatchModal(false);
      loadUsers();
    } else {
      alert(res.error || "Merge failed");
    }
  };

  const initiateDelete = (uid: string) => {
    if (userProfile?.role !== "SUPER_ADMIN") return;
    setTargetActionId(uid);
    setShowPasswordModal(true);
  };

  const initiateEdit = (user: UserProfile) => {
    if (userProfile?.role !== "SUPER_ADMIN") return;
    setEditingUser(user);
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!userProfile?.email || !editingUser) return;

    const formData = new FormData(e.currentTarget);
    const updatedData = {
      name: formData.get("name") as string,
      initiatedName: formData.get("initiatedName") as string,
      mobileNumber: formData.get("mobileNumber") as string,
      whatsappNumber: formData.get("whatsappNumber") as string,
      bloodGroup: formData.get("bloodGroup") as string,
      joinedIskconDate: formData.get("joinedIskconDate") as string,
      initiatedYear: formData.get("initiatedYear") as string,
      address: {
        division: formData.get("division") as string,
        district: formData.get("district") as string,
        thana: formData.get("thana") as string,
      }
    };

    const password = prompt("Please enter Super Admin password to confirm changes:");
    if (!password) return;

    setLoading(true);
    const res = await updateUserAction(editingUser.uid, updatedData, password, userProfile.email);
    if (res.success) {
      alert("User updated successfully!");
      setShowEditModal(false);
      loadUsers();
    } else {
      alert(res.error || "Update failed");
    }
    setLoading(false);
  };

  const executeDelete = async () => {
    if (!userProfile?.email || !targetActionId) return;
    const res = await deleteUser(targetActionId, passwordInput, userProfile.email);
    if (res.success) {
      setShowPasswordModal(false);
      setPasswordInput("");
      loadUsers();
    } else {
      alert(res.error || "Deletion failed. Incorrect Password?");
    }
  };

  const isSuperAdmin = userProfile?.role === "SUPER_ADMIN";
  const applyAntiCopy = !isSuperAdmin;

  const pendingUsers = users.filter(u => u.role === "PENDING" && !u.isApproved);
  let approvedUsers = users.filter(u => u.isApproved);

  if (searchYear) {
    const normalizedSearch = normalizeNumbers(searchYear);
    approvedUsers = approvedUsers.filter(u => 
      normalizeNumbers(u.initiatedYear).includes(normalizedSearch)
    );
  }
  if (searchDistrict) {
    approvedUsers = approvedUsers.filter(u => u.address?.district?.toLowerCase().includes(searchDistrict.toLowerCase()));
  }

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(approvedUsers.map(u => ({
      Name: u.name,
      "Initiated Name": u.initiatedName,
      "Mobile Number": u.mobileNumber,
      "WhatsApp Number": u.whatsappNumber,
      "Blood Group": u.bloodGroup,
      "Spiritual Master": u.spiritualMaster,
      "Joined ISKCON Year": u.joinedIskconDate,
      "Initiated Year": u.initiatedYear,
      District: u.address?.district,
      Thana: u.address?.thana,
      Division: u.address?.division,
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Disciple List");
    XLSX.writeFile(wb, "DiscipleList.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF() as jsPDFWithAutoTable;
    doc.text("Approved Disciples List", 14, 15);
    const tableColumn = ["Name", "Initiated Name", "Mobile", "District", "Initiated Year"];
    const tableRows: any[] = [];
    approvedUsers.forEach(u => {
      tableRows.push([u.name || "", u.initiatedName || "", u.mobileNumber || "", u.address?.district || "", u.initiatedYear || ""]);
    });
    doc.autoTable({ head: [tableColumn], body: tableRows, startY: 20 });
    doc.save("DiscipleList.pdf");
  };

  const downloadSampleExcel = () => {
    const headers = [
      "Name", "Initiated Name", "Mobile Number", "WhatsApp Number", 
      "Blood Group", "Joined ISKCON Date", "Initiated Year", "Spiritual Master", 
      "Division", "District", "Thana"
    ];
    const ws = XLSX.utils.aoa_to_sheet([headers, [
      "Ananda Kumar", "Ananda Svarupa Nitai Das", "017XXXXXXXX", "017XXXXXXXX", 
      "O+", "2015", "2018", "HH Jayapataka Swami", 
      "Sylhet", "Sylhet", "Kotwali"
    ]]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sample");
    XLSX.writeFile(wb, "Import_Template.xlsx");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userProfile?.email) return;
    
    setLoading(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        
        if (data.length > 0) {
          const res = await importDisciplesAction(data, userProfile.email!);
          if (res.success) {
            alert(`Successfully imported ${data.length} disciples!`);
            loadUsers();
          } else {
            alert(res.error || "Import failed");
          }
        }
      } catch (err) {
        console.error("File processing error", err);
        alert("Failed to process file. Make sure it is a valid Excel/CSV.");
      }
      setLoading(false);
    };
    reader.readAsBinaryString(file);
  };

  return (
    <ProtectedRoute allowedRoles={["ADMIN", "SUPER_ADMIN"]}>
      <div className={`${styles.container} ${applyAntiCopy ? styles.preventCopy : ""}`} 
           onContextMenu={e => { if(applyAntiCopy) e.preventDefault(); }}
           onDragStart={e => { if(applyAntiCopy) e.preventDefault(); }}>
        <Navbar />
        
        <main className={styles.main}>
          <div className={styles.tabs}>
            <button className={`${styles.tabBtn} ${activeTab === "pending" ? styles.tabBtnActive : ""}`} onClick={() => setActiveTab("pending")}>
              Pending Approvals ({pendingUsers.length})
            </button>
            <button className={`${styles.tabBtn} ${activeTab === "approved" ? styles.tabBtnActive : ""}`} onClick={() => setActiveTab("approved")}>
              Approved Users ({approvedUsers.length})
            </button>
            {isSuperAdmin && (
              <button className={`${styles.tabBtn} ${activeTab === "import" ? styles.tabBtnActive : ""}`} onClick={() => setActiveTab("import")}>
                Data Import
              </button>
            )}
          </div>

          {loading ? (
             <p>লোড হচ্ছে... (Loading data...)</p>
          ) : (
            <>
              {activeTab === "pending" && (
                <div className={styles.card}>
                  <h2 className={styles.cardTitle}>অপেক্ষমান অনুমোদন (Pending Approvals)</h2>
                  {pendingUsers.length === 0 ? <p>কোনো অপেক্ষমান ব্যবহারকারী নেই। (No pending users.)</p> : (
                    <div className={styles.tableContainer}>
                      <table className={styles.table}>
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Initiated Name</th>
                            <th>Mobile</th>
                            <th>Spiritual Master</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pendingUsers.map(u => (
                            <tr key={u.uid}>
                              <td>{u.name}</td>
                              <td>{u.initiatedName}</td>
                              <td>{u.mobileNumber}</td>
                              <td>{u.spiritualMaster}</td>
                              <td>
                                <button className={`${styles.actionBtn} ${styles.approveBtn}`} onClick={() => handleFindMatches(u)}>Merge & Approve</button>
                                {isSuperAdmin && <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => initiateDelete(u.uid)}>Delete</button>}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "approved" && (
                <div className={styles.card}>
                  <div className={styles.toolbar}>
                    <h2 className={styles.cardTitle}>অনুমোদিত ভক্তগণ (Approved Disciples)</h2>
                    <div>
                      <button className={styles.exportBtn} onClick={exportToExcel} style={{marginRight: '1rem'}}>Export Excel</button>
                      <button className={styles.exportBtn} onClick={exportToPDF} style={{background: '#dc2626'}}>Export PDF</button>
                    </div>
                  </div>

                  <div className={styles.filters}>
                    <input type="text" placeholder="Filter by Year..." className={styles.filterSelect} value={searchYear} onChange={e => setSearchYear(e.target.value)} />
                    <input type="text" placeholder="Filter by District..." className={styles.filterSelect} value={searchDistrict} onChange={e => setSearchDistrict(e.target.value)} />
                  </div>
                  
                  <div className={styles.tableContainer}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>Photo</th>
                          <th>Name</th>
                          <th>Initiated Name</th>
                          <th>District</th>
                          <th>Initiated Year</th>
                          {isSuperAdmin && <th style={{width: '150px'}}>Actions</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {approvedUsers.map(u => (
                          <tr key={u.uid}>
                            <td style={{width: '60px'}}>
                              {u.profileImageURL ? (
                                <img 
                                  src={u.profileImageURL} 
                                  alt={u.name} 
                                  className={styles.profileThumb} 
                                  style={{pointerEvents: applyAntiCopy ? 'none' : 'auto'}} 
                                />
                              ) : (
                                <div className={styles.noThumb}>N/A</div>
                              )}
                            </td>
                            <td>{u.name}</td>
                            <td>{u.initiatedName}</td>
                            <td>{u.address?.district}</td>
                            <td>{u.initiatedYear}</td>
                            {isSuperAdmin && (
                              <td>
                                <button className={`${styles.actionBtn} ${styles.approveBtn}`} style={{background: '#2563eb', marginBottom: '4px'}} onClick={() => initiateEdit(u)}>Edit</button>
                                <button className={`${styles.actionBtn} ${styles.deleteBtn}`} onClick={() => initiateDelete(u.uid)}>Delete</button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === "import" && isSuperAdmin && (
                <div className={styles.card}>
                  <h2 className={styles.cardTitle}>Data Import</h2>
                  <p>In case you want to batch import offline records securely.</p>
                  
                  <div style={{marginTop: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center'}}>
                    <button onClick={downloadSampleExcel} className={styles.exportBtn} style={{background: '#10b981'}}>
                      Download Sample Excel
                    </button>
                    <span>OR</span>
                    <input type="file" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" onChange={handleFileUpload} />
                  </div>
                </div>
              )}
            </>
          )}
        </main>

        {/* Modal for Super Admin Password */}
        {showPasswordModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <h3 className={styles.modalTitle}>Super Admin Action Required</h3>
              <p style={{marginBottom: '1rem', color: '#64748b'}}>Please enter the system password to confirm deletion.</p>
              <input type="password" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} className={styles.modalInput} placeholder="Enter password..." />
              <div className={styles.modalActions}>
                <button className={styles.modalBtn} onClick={() => setShowPasswordModal(false)}>Cancel</button>
                <button className={`${styles.modalBtn} ${styles.deleteBtn}`} onClick={executeDelete}>Confirm Delete</button>
              </div>
            </div>
          </div>
        )}

        {/* Modal for Matching Search */}
        {showMatchModal && selectedPendingUser && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal} style={{maxWidth: '500px'}}>
              <h3 className={styles.modalTitle}>Match Found! (মিল পাওয়া গেছে)</h3>
              <p style={{marginBottom: '1rem', color: '#64748b'}}>
                We found offline records matching <b>{selectedPendingUser.initiatedName}</b>. Do you want to merge this new login request with an existing offline record?
              </p>
              {matchingUsers.map((m) => (
                <div key={m.id} style={{padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '1rem'}}>
                  <p><b>Name:</b> {m.name}</p>
                  <p><b>Mobile:</b> {m.mobileNumber}</p>
                  <div style={{marginTop: '1rem', display: 'flex', gap: '0.5rem'}}>
                    <button className={`${styles.modalBtn} ${styles.approveBtn}`} style={{fontSize: '0.8rem'}} onClick={() => handleMerge(m.id, true)}>Merge (Keep Offline Mobile)</button>
                    <button className={`${styles.modalBtn} ${styles.approveBtn}`} style={{fontSize: '0.8rem', background: '#2563eb'}} onClick={() => handleMerge(m.id, false)}>Merge (Keep New Mobile)</button>
                  </div>
                </div>
              ))}
              <div className={styles.modalActions} style={{marginTop: '1.5rem'}}>
                <button className={styles.modalBtn} onClick={() => { setShowMatchModal(false); setMatchingUsers([]); }}>Cancel</button>
                <button className={`${styles.modalBtn} ${styles.deleteBtn}`} onClick={() => { handleApprove(selectedPendingUser.uid); setShowMatchModal(false); }}>Approve as NEW Record</button>
              </div>
            </div>
          </div>
        )}

        {/* Modal for Editing User */}
        {showEditModal && editingUser && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal} style={{maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto'}}>
              <h3 className={styles.modalTitle}>Edit Disciple Information</h3>
              <form onSubmit={handleEditSubmit}>
                <div className={styles.editGrid}>
                  <div className={styles.fieldGroup}>
                    <label className={styles.modalLabel}>Name</label>
                    <input type="text" name="name" defaultValue={editingUser.name} className={styles.modalInput} required />
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className={styles.modalLabel}>Initiated Name</label>
                    <input type="text" name="initiatedName" defaultValue={editingUser.initiatedName} className={styles.modalInput} required />
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className={styles.modalLabel}>Mobile Number</label>
                    <input type="text" name="mobileNumber" defaultValue={editingUser.mobileNumber} className={styles.modalInput} required />
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className={styles.modalLabel}>WhatsApp Number</label>
                    <input type="text" name="whatsappNumber" defaultValue={editingUser.whatsappNumber} className={styles.modalInput} />
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className={styles.modalLabel}>Blood Group</label>
                    <input type="text" name="bloodGroup" defaultValue={editingUser.bloodGroup} className={styles.modalInput} />
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className={styles.modalLabel}>Joined Year</label>
                    <input type="text" name="joinedIskconDate" defaultValue={editingUser.joinedIskconDate} className={styles.modalInput} />
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className={styles.modalLabel}>Initiated Year</label>
                    <input type="text" name="initiatedYear" defaultValue={editingUser.initiatedYear} className={styles.modalInput} />
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className={styles.modalLabel}>Division</label>
                    <input type="text" name="division" defaultValue={editingUser.address?.division} className={styles.modalInput} />
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className={styles.modalLabel}>District</label>
                    <input type="text" name="district" defaultValue={editingUser.address?.district} className={styles.modalInput} />
                  </div>
                  <div className={styles.fieldGroup}>
                    <label className={styles.modalLabel}>Thana</label>
                    <input type="text" name="thana" defaultValue={editingUser.address?.thana} className={styles.modalInput} />
                  </div>
                </div>
                <div className={styles.modalActions} style={{marginTop: '1.5rem'}}>
                  <button type="button" className={styles.modalBtn} onClick={() => setShowEditModal(false)}>Cancel</button>
                  <button type="submit" className={`${styles.modalBtn} ${styles.approveBtn}`}>Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </ProtectedRoute>
  );
}
