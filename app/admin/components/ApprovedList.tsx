"use client";

import React, { useState, useMemo, useRef } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  FileSpreadsheet, 
  FileText, 
  Upload, 
  Eye, 
  Edit3, 
  Trash2, 
  User,
  Plus
} from "lucide-react";
import { UserProfile } from "../../context/AuthContext";
import { importDisciplesAction } from "../../actions/adminActions";
import { normalizeNumbers } from "../../lib/utils";

interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => void;
}

interface ApprovedListProps {
  approvedUsers: UserProfile[];
  adminEmail: string;
  isSuperAdmin: boolean;
  onViewDetails: (user: UserProfile) => void;
  onEdit: (user: UserProfile) => void;
  onDelete: (uid: string) => void;
  onRefresh: () => void;
}

export default function ApprovedList({
  approvedUsers,
  adminEmail,
  isSuperAdmin,
  onViewDetails,
  onEdit,
  onDelete,
  onRefresh,
}: ApprovedListProps) {
  // Sort State
  const [sortField, setSortField] = useState<string>("serialNo");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedBloodGroup, setSelectedBloodGroup] = useState("");
  const [selectedGender, setSelectedGender] = useState("");
  const [selectedHarinam, setSelectedHarinam] = useState("");
  const [selectedBrahman, setSelectedBrahman] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);

  // Column Headers Config
  const columns = [
    { label: "সিরিয়েল (SL)", field: "serialNo" },
    { label: "ছবি (Photo)", field: "" },
    { label: "দীক্ষানাম (Initiated Name)", field: "initiatedName" },
    { label: "নাম (Name)", field: "name" },
    { label: "মোবাইল (Mobile)", field: "mobileNumber" },
    { label: "দীক্ষা বছর (Year)", field: "initiatedYear" },
    { label: "রক্তের গ্রুপ (Blood)", field: "bloodGroup" },
    { label: "লিঙ্গ (Gender)", field: "gender" },
    { label: "ঠিকানা (Address)", field: "presentAddress" },
    { label: "পদক্ষেপ (Actions)", field: "" }
  ];

  // Extraction of unique values for premium dropdown filters
  const uniqueDistricts = useMemo(() => {
    const districts = new Set<string>();
    approvedUsers.forEach(u => {
      // Find district from presentAddress, permanentAddress, or legacy address district
      let dist = "";
      if (u.presentAddress) {
        // Simple extraction fallback or matching
        const parts = u.presentAddress.split(",");
        dist = parts[parts.length - 1]?.trim() || "";
      }
      if (!dist && u.address?.district) {
        dist = u.address.district;
      }
      if (dist) districts.add(dist);
    });
    return Array.from(districts).sort();
  }, [approvedUsers]);

  const uniqueYears = useMemo(() => {
    const years = new Set<string>();
    approvedUsers.forEach(u => {
      if (u.initiatedYear) {
        const norm = normalizeNumbers(u.initiatedYear);
        const match = norm.match(/\b(19\d\d|20\d\d)\b/);
        if (match) {
          years.add(match[1]);
        } else if (norm.length === 4 && !isNaN(Number(norm))) {
          years.add(norm);
        }
      }
    });
    return Array.from(years).sort((a, b) => parseInt(a) - parseInt(b));
  }, [approvedUsers]);

  // Handle Sort Change
  const handleSort = (field: string) => {
    if (!field) return;
    if (sortField === field) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Filtered & Sorted Disciples
  const processedUsers = useMemo(() => {
    let result = [...approvedUsers];

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(u => 
        (u.name || "").toLowerCase().includes(term) ||
        (u.initiatedName || "").toLowerCase().includes(term) ||
        (u.mobileNumber || "").includes(term)
      );
    }

    // District filter
    if (selectedDistrict) {
      const dist = selectedDistrict.toLowerCase();
      result = result.filter(u => 
        (u.presentAddress || "").toLowerCase().includes(dist) ||
        (u.permanentAddress || "").toLowerCase().includes(dist) ||
        (u.address?.district || "").toLowerCase().includes(dist)
      );
    }

    // Year filter
    if (selectedYear) {
      result = result.filter(u => {
        if (!u.initiatedYear) return false;
        const normYear = normalizeNumbers(u.initiatedYear);
        return normYear.includes(selectedYear);
      });
    }

    // Blood Group filter
    if (selectedBloodGroup) {
      result = result.filter(u => u.bloodGroup === selectedBloodGroup);
    }

    // Gender filter
    if (selectedGender) {
      result = result.filter(u => (u.gender || "").toLowerCase() === selectedGender.toLowerCase());
    }

    // Harinam filter
    if (selectedHarinam) {
      result = result.filter(u => (u.harinamInitiation || "").toLowerCase().includes(selectedHarinam.toLowerCase()));
    }

    // Brahman filter
    if (selectedBrahman) {
      result = result.filter(u => (u.brahmanInitiation || "").toLowerCase().includes(selectedBrahman.toLowerCase()));
    }

    // Sorting
    if (sortField) {
      result.sort((a: any, b: any) => {
        let valA = a[sortField] ?? "";
        let valB = b[sortField] ?? "";

        // Year sorting specifically
        if (sortField === "initiatedYear") {
          const normA = normalizeNumbers(valA);
          const normB = normalizeNumbers(valB);
          
          const matchA = normA.match(/\b(19\d\d|20\d\d)\b/);
          const matchB = normB.match(/\b(19\d\d|20\d\d)\b/);
          
          const yearA = matchA ? parseInt(matchA[1], 10) : 0;
          const yearB = matchB ? parseInt(matchB[1], 10) : 0;
          
          if (yearA !== yearB) {
            return sortDirection === "asc" ? yearA - yearB : yearB - yearA;
          }
        }

        // Numeric fields sorting (serialNo, oldSerialNo)
        if (sortField === "serialNo" || sortField === "oldSerialNo") {
          const normA = normalizeNumbers(valA).replace(/\D/g, "");
          const normB = normalizeNumbers(valB).replace(/\D/g, "");
          
          const numA = parseInt(normA, 10);
          const numB = parseInt(normB, 10);
          
          if (!isNaN(numA) && !isNaN(numB)) {
            return sortDirection === "asc" ? numA - numB : numB - numA;
          }
          if (isNaN(numA)) return sortDirection === "asc" ? 1 : -1;
          if (isNaN(numB)) return sortDirection === "asc" ? -1 : 1;
        }

        // String fields sorting
        const strA = String(valA).trim().toLowerCase();
        const strB = String(valB).trim().toLowerCase();
        if (strA < strB) return sortDirection === "asc" ? -1 : 1;
        if (strA > strB) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [approvedUsers, searchTerm, selectedDistrict, selectedYear, selectedBloodGroup, selectedGender, selectedHarinam, selectedBrahman, sortField, sortDirection]);

  // Import Action
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !adminEmail) return;

    setImporting(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawData = XLSX.utils.sheet_to_json(ws);

        if (rawData.length > 0) {
          const res = await importDisciplesAction(rawData, adminEmail);
          if (res.success) {
            alert(`সফলভাবে আমদানি করা হয়েছে: ${res.count} জন!\nডুপ্লিকেট বাদ দেওয়া হয়েছে: ${res.duplicates} টি।`);
            onRefresh();
          } else {
            alert(res.error || "আমদানি ব্যর্থ হয়েছে। (Import failed)");
          }
        } else {
          alert("এক্সেল ফাইলে কোনো ডেটা পাওয়া যায়নি।");
        }
      } catch (err) {
        console.error("File processing error", err);
        alert("ফাইল প্রসেস করতে ত্রুটি হয়েছে। অনুগ্রহ করে সঠিক এক্সেল ফাইল আপলোড করুন।");
      }
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsBinaryString(file);
  };

  // Export to Excel Action
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(processedUsers.map(u => ({
      "Serial No.": u.serialNo || "",
      "Old Serial No.": u.oldSerialNo || "",
      "Name": u.name || "",
      "Initiated Name": u.initiatedName || "",
      "Mobile Number": u.mobileNumber || "",
      "WhatsApp Number": u.whatsappNumber || "",
      "Blood Group": u.bloodGroup || "",
      "DOB": u.dob || "",
      "Gender": u.gender || "",
      "Marital Status": u.maritalStatus || "",
      "Joined ISKCON Year": u.joinedIskconDate || "",
      "Sheltered Date": u.shelteredDate || "",
      "Spiritual Master": u.spiritualMaster || "",
      "Harinama Initiation": u.harinamInitiation || "",
      "Initiated Year": u.initiatedYear || "",
      "Initiation Place": u.initiationPlace || "",
      "Brahman Initiation": u.brahmanInitiation || "",
      "Brahman Date": u.brahmanInitiationDate || "",
      "Brahman Place": u.brahmanInitiationPlace || "",
      "Counselor Name": u.counselorName || "",
      "Department": u.department || "",
      "Service": u.service || "",
      "Sadhana Grantha": u.sadhanaGrantha || "",
      "Is Namahatta Connected": u.isNamahattaConnected || "",
      "Namahatta Name": u.namahattaName || "",
      "Present Address": u.presentAddress || "",
      "Permanent Address": u.permanentAddress || "",
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Disciples List");
    XLSX.writeFile(wb, "JSSS_Approved_Disciples.xlsx");
  };

  // Export to PDF Action
  const exportToPDF = () => {
    const doc = new jsPDF() as jsPDFWithAutoTable;
    doc.text("Sylhet ISKCON - JSSS Approved Disciples List", 14, 15);
    const tableColumn = ["SL", "Name", "Initiated Name", "Mobile", "Initiated Year", "Blood"];
    const tableRows: any[] = [];
    processedUsers.forEach(u => {
      tableRows.push([
        u.serialNo || "", 
        u.name || "", 
        u.initiatedName || "", 
        u.mobileNumber || "", 
        u.initiatedYear || "",
        u.bloodGroup || ""
      ]);
    });
    doc.autoTable({ head: [tableColumn], body: tableRows, startY: 20 });
    doc.save("ApprovedDisciples.pdf");
  };

  return (
    <div className="space-y-6">
      
      {/* Search, Action Toolbar & Imports */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="নাম, দীক্ষানাম অথবা মোবাইল নম্বর দিয়ে খুঁজুন..."
            className="w-full pl-10 pr-4 py-2.5 border border-slate-350 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none text-sm transition text-slate-800 bg-white"
          />
        </div>

        {/* Toolbar Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {/* File upload trigger */}
          <div>
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-sm transition shadow-xs disabled:bg-slate-300"
            >
              <Upload className="w-4 h-4" />
              {importing ? "আমদানি হচ্ছে..." : "এক্সেল আমদানি (Import Excel)"}
            </button>
          </div>

          <button
            onClick={exportToExcel}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg text-sm transition shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-450" />
            Excel ডাউনলোড
          </button>
          
          <button
            onClick={exportToPDF}
            className="flex items-center gap-1.5 px-4 py-2 bg-red-650 hover:bg-red-750 text-white font-semibold rounded-lg text-sm transition shadow-xs"
          >
            <FileText className="w-4 h-4" />
            PDF ডাউনলোড
          </button>
        </div>
      </div>

      {/* Filter Options Expandable panel */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 shadow-2xs text-slate-800">
        <div className="flex items-center gap-2 text-slate-700 font-bold border-b border-slate-200 pb-2">
          <Filter className="w-4 h-4" />
          <span>ফিল্টারসমূহ (Filters)</span>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {/* District Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">জেলা (District)</label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs outline-none bg-white"
            >
              <option value="">সকল জেলা (All)</option>
              {uniqueDistricts.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Year Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">দীক্ষা সাল (Year)</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs outline-none bg-white"
            >
              <option value="">সকল বছর (All)</option>
              {uniqueYears.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Blood Group */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">রক্তের গ্রুপ (Blood)</label>
            <select
              value={selectedBloodGroup}
              onChange={(e) => setSelectedBloodGroup(e.target.value)}
              className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs outline-none bg-white"
            >
              <option value="">সকল গ্রুপ (All)</option>
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

          {/* Gender */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">লিঙ্গ (Gender)</label>
            <select
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
              className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs outline-none bg-white"
            >
              <option value="">সকল (All)</option>
              <option value="Male">পুরুষ (Male)</option>
              <option value="Female">নারী (Female)</option>
            </select>
          </div>

          {/* Harinam Initiation */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">হরিনাম দীক্ষা (Harinam)</label>
            <select
              value={selectedHarinam}
              onChange={(e) => setSelectedHarinam(e.target.value)}
              className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs outline-none bg-white"
            >
              <option value="">সকল (All)</option>
              <option value="Yes">হ্যাঁ (Yes)</option>
              <option value="No">না (No)</option>
            </select>
          </div>

          {/* Brahman Initiation */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">ব্রাহ্মন দীক্ষা (Brahman)</label>
            <select
              value={selectedBrahman}
              onChange={(e) => setSelectedBrahman(e.target.value)}
              className="w-full px-2 py-1.5 border border-slate-300 rounded-lg text-xs outline-none bg-white"
            >
              <option value="">সকল (All)</option>
              <option value="Yes">হ্যাঁ (Yes)</option>
              <option value="No">না (No)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Disciples Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden text-slate-800">
        <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800">অনুমোদিত শিষ্য তালিকা (Approved Disciples)</h3>
            <p className="text-xs text-slate-400 mt-0.5">মোট প্রাপ্ত রেকর্ড: {processedUsers.length} জন</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                {columns.map((col, i) => (
                  <th 
                    key={i} 
                    onClick={() => handleSort(col.field)}
                    className={`py-4 px-6 ${col.field ? "cursor-pointer select-none hover:bg-slate-100 transition" : ""}`}
                  >
                    <div className="flex items-center gap-1">
                      <span>{col.label}</span>
                      {col.field && (
                        sortField === col.field ? (
                          sortDirection === "asc" ? <ArrowUp className="w-3.5 h-3.5 text-amber-600" /> : <ArrowDown className="w-3.5 h-3.5 text-amber-600" />
                        ) : <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {processedUsers.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="text-center py-10 text-slate-450 font-medium bg-slate-50/20">
                    কোনো অনুমোদিত রেকর্ড খুঁজে পাওয়া যায়নি। (No records found)
                  </td>
                </tr>
              ) : (
                processedUsers.map((u, index) => (
                  <tr key={u.uid || index} className="hover:bg-slate-50/70 transition duration-150">
                    {/* Serial No */}
                    <td className="py-4 px-6 font-semibold text-slate-700">
                      {u.serialNo || "—"}
                    </td>

                    {/* Photo */}
                    <td className="py-4 px-6">
                      {u.profileImageURL ? (
                        <img 
                          src={u.profileImageURL} 
                          alt={u.name} 
                          className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-sm bg-slate-100"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center font-bold text-sm border border-slate-200">
                          {u.name?.charAt(0) || "D"}
                        </div>
                      )}
                    </td>

                    {/* Initiated Name */}
                    <td className="py-4 px-6 font-bold text-slate-900">
                      {u.initiatedName || "—"}
                    </td>

                    {/* Name */}
                    <td className="py-4 px-6 font-medium text-slate-600">
                      {u.name || "—"}
                    </td>

                    {/* Mobile Number */}
                    <td className="py-4 px-6 text-slate-650">
                      {u.mobileNumber || "—"}
                    </td>

                    {/* Initiated Year */}
                    <td className="py-4 px-6 text-slate-650">
                      {u.initiatedYear || "—"}
                    </td>

                    {/* Blood Group */}
                    <td className="py-4 px-6 text-center">
                      {u.bloodGroup ? (
                        <span className="px-2 py-0.5 bg-red-50 text-red-700 text-xs font-bold rounded-md border border-red-100">
                          {u.bloodGroup}
                        </span>
                      ) : "—"}
                    </td>

                    {/* Gender */}
                    <td className="py-4 px-6 text-slate-600">
                      {u.gender || "—"}
                    </td>

                    {/* Address */}
                    <td className="py-4 px-6 text-xs text-slate-500 max-w-xs truncate" title={u.presentAddress || ""}>
                      {u.presentAddress || u.address?.district || "—"}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => onViewDetails(u)}
                          className="p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-700 rounded-lg transition"
                          title="বিস্তারিত দেখুন (View Details)"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {isSuperAdmin && (
                          <>
                            <button
                              onClick={() => onEdit(u)}
                              className="p-1.5 hover:bg-amber-50 text-slate-500 hover:text-amber-700 rounded-lg transition"
                              title="সম্পাদনা করুন (Edit)"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            
                            <button
                              onClick={() => onDelete(u.uid)}
                              className="p-1.5 hover:bg-red-55 text-slate-500 hover:text-red-700 rounded-lg transition"
                              title="মুছে ফেলুন (Delete)"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
