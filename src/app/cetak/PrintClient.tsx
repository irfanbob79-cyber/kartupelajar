"use client";

import { useState, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Printer,
  Download,
  CheckCircle2,
  Filter,
  Eye,
  Settings,
  Scissors,
  Layers,
  ArrowLeft,
  RefreshCw,
  FileText,
} from "lucide-react";
import StudentCardFront from "@/components/card/StudentCardFront";
import StudentCardBack from "@/components/card/StudentCardBack";
import { togglePrintStatus } from "@/app/actions/student";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface Major {
  id: string;
  code: string;
  name: string;
  themeColor: string;
  accentColor: string;
}

interface Student {
  id: string;
  nis: string;
  nisn: string;
  fullName: string;
  birthPlace: string;
  birthDate: string;
  gender: string;
  address: string;
  photoUrl: string | null;
  validUntil: string;
  isPrinted: boolean;
  majorId: string;
  major: Major;
}

interface School {
  schoolName: string;
  npsn: string;
  address: string;
  phone: string;
  website: string;
  principalName: string;
  principalNip: string;
  cityIssued: string;
  academicYear: string;
  logoLeftUrl?: string | null;
  logoRightUrl?: string | null;
  signatureUrl?: string | null;
  stampUrl?: string | null;
}

interface PrintClientProps {
  students: Student[];
  school: School;
  initialSelectedIds?: string[];
}

export default function PrintClient({
  students,
  school,
  initialSelectedIds = [],
}: PrintClientProps) {
  const router = useRouter();
  const printSheetRef = useRef<HTMLDivElement | null>(null);

  // Selection
  const [selectedIds, setSelectedIds] = useState<string[]>(
    initialSelectedIds.length > 0
      ? initialSelectedIds
      : students.slice(0, 8).map((s) => s.id)
  );

  // Settings
  const [cardSide, setCardSide] = useState<"FRONT" | "BACK" | "BOTH">("FRONT");
  const [showCropMarks, setShowCropMarks] = useState(true);
  const [filterMajor, setFilterMajor] = useState("ALL");
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Filtered available students to pick
  const selectableStudents = useMemo(() => {
    return students.filter((s) => {
      if (filterMajor === "ALL") return true;
      return s.majorId === filterMajor;
    });
  }, [students, filterMajor]);

  // Selected student objects
  const selectedStudents = useMemo(() => {
    return students.filter((s) => selectedIds.includes(s.id));
  }, [students, selectedIds]);

  // Quick selection helpers
  const handleSelectAllFiltered = () => {
    setSelectedIds(selectableStudents.map((s) => s.id));
  };

  const handleSelectUnprinted = () => {
    setSelectedIds(selectableStudents.filter((s) => !s.isPrinted).map((s) => s.id));
  };

  const handleToggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Mark all selected as printed
  const handleMarkAsPrinted = async () => {
    if (confirm(`Tandai ${selectedStudents.length} siswa sebagai SUDAH DICETAK?`)) {
      for (const st of selectedStudents) {
        await togglePrintStatus(st.id, true);
      }
      router.refresh();
      alert("Status cetak berhasil diperbarui!");
    }
  };

  // Browser Native Print
  const handleNativePrint = () => {
    window.print();
  };

  // Export PDF using jsPDF
  const handleDownloadPdf = async () => {
    if (!printSheetRef.current) return;
    setIsExportingPdf(true);

    try {
      const element = printSheetRef.current;
      const canvas = await html2canvas(element, {
        scale: 2, // High resolution
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Kartu_Pelajar_${Date.now()}.pdf`);
    } catch (err: any) {
      alert("Gagal men-generate PDF: " + err.message);
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Major list for filter
  const majors = useMemo(() => {
    const map = new Map<string, Major>();
    students.forEach((s) => {
      if (s.major) map.set(s.major.id, s.major);
    });
    return Array.from(map.values());
  }, [students]);

  return (
    <div className="p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Top Header (no-print) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/siswa"
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Printer className="w-7 h-7 text-blue-600" />
              <span>Studio Cetak Kartu Pelajar</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Siap cetak {selectedStudents.length} kartu dengan layout lembar A4 standar CR80 (54 × 86 mm)
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isExportingPdf || selectedStudents.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors shadow-2xs disabled:opacity-50"
          >
            {isExportingPdf ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4 text-blue-600" />
            )}
            <span>{isExportingPdf ? "Membuat PDF..." : "Unduh PDF (jsPDF)"}</span>
          </button>

          <button
            type="button"
            onClick={handleNativePrint}
            disabled={selectedStudents.length === 0}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition-all disabled:opacity-50"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / Print Dialog</span>
          </button>
        </div>
      </div>

      {/* Control Panel (no-print) */}
      <div className="no-print bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 1. Card Side Option */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Sisi Kartu yang Dicetak:
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setCardSide("FRONT")}
                className={`py-2 px-2.5 rounded-xl border text-center transition-all ${
                  cardSide === "FRONT"
                    ? "bg-blue-50 border-blue-600 text-blue-700 font-bold ring-2 ring-blue-500/20"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                Sisi Depan
              </button>
              <button
                type="button"
                onClick={() => setCardSide("BACK")}
                className={`py-2 px-2.5 rounded-xl border text-center transition-all ${
                  cardSide === "BACK"
                    ? "bg-blue-50 border-blue-600 text-blue-700 font-bold ring-2 ring-blue-500/20"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                Sisi Belakang
              </button>
              <button
                type="button"
                onClick={() => setCardSide("BOTH")}
                className={`py-2 px-2.5 rounded-xl border text-center transition-all ${
                  cardSide === "BOTH"
                    ? "bg-blue-50 border-blue-600 text-blue-700 font-bold ring-2 ring-blue-500/20"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                Keduanya (Duplex)
              </button>
            </div>
          </div>

          {/* 2. Crop Marks Toggle */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Panduan Pemotongan:
            </label>
            <button
              type="button"
              onClick={() => setShowCropMarks(!showCropMarks)}
              className={`w-full py-2 px-3 rounded-xl border flex items-center justify-between text-xs font-semibold transition-all ${
                showCropMarks
                  ? "bg-emerald-50 border-emerald-500 text-emerald-800"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span className="flex items-center gap-2">
                <Scissors className="w-4 h-4" />
                <span>Garis Potong (Crop Marks)</span>
              </span>
              <span className="font-bold">{showCropMarks ? "AKTIF" : "NONAKTIF"}</span>
            </button>
          </div>

          {/* 3. Mark as Printed */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Status Database:
            </label>
            <button
              type="button"
              onClick={handleMarkAsPrinted}
              disabled={selectedStudents.length === 0}
              className="w-full py-2 px-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100 flex items-center justify-center gap-2 text-xs font-semibold transition-colors disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Tandai {selectedStudents.length} Siswa Sudah Dicetak</span>
            </button>
          </div>
        </div>

        {/* Info Kalibrasi RFID 13.56 MHz (CR80) */}
        <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200/80 text-blue-900 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scissors className="w-4 h-4 text-blue-700 shrink-0" />
            <span>
              <strong>Kalibrasi Kartu RFID 13.56 MHz (CR80):</strong> Ukuran cetak disetel presisi 54 × 86 mm dengan garis potong (Crop Marks) dan jarak toleransi potong (Bleed) agar saat pemotongan menggunakan alat potong kartu PVC tidak ada bagian kartu yang kurang.
            </span>
          </div>
          <span className="text-[10px] font-mono font-bold bg-white px-2 py-0.5 rounded border border-blue-200 text-blue-800 shrink-0 ml-2">
            CR80 54 × 86 mm
          </span>
        </div>

        {/* Student Selector Drawer / Bar */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Filter Jurusan:</span>
            <select
              value={filterMajor}
              onChange={(e) => setFilterMajor(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-800"
            >
              <option value="ALL">Semua Jurusan</option>
              {majors.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.code} - {m.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSelectAllFiltered}
              className="px-3 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold"
            >
              Pilih Semua ({selectableStudents.length})
            </button>
            <button
              type="button"
              onClick={handleSelectUnprinted}
              className="px-3 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold"
            >
              Pilih Belum Dicetak
            </button>
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="px-3 py-1 rounded-lg text-red-600 hover:bg-red-50 font-semibold"
            >
              Batal Pilih
            </button>
          </div>
        </div>
      </div>

      {/* Selected Student Pill Checkboxes (no-print) */}
      <div className="no-print bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
        <span className="text-xs font-bold text-slate-700 block">
          Daftar Siswa untuk Dicetak (Klik untuk memilih/membatalkan):
        </span>
        <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-1">
          {selectableStudents.map((st) => {
            const isChecked = selectedIds.includes(st.id);
            return (
              <button
                key={st.id}
                type="button"
                onClick={() => handleToggleSelectOne(st.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-all ${
                  isChecked
                    ? "bg-blue-600 border-blue-600 text-white shadow-xs"
                    : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <span>{st.nis}</span>
                <span className="font-bold">{st.fullName.split(" ")[0]}</span>
                <span className="text-[10px] opacity-75">[{st.major.code}]</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* WYSIWYG A4 PRINT SHEET (This section renders in Print) */}
      <div className="space-y-4">
        <div className="no-print flex items-center justify-between">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-blue-600" />
            <span>Pratinjau Lembar Cetak A4 ({selectedStudents.length} Kartu Terpasang)</span>
          </span>
          <span className="text-[11px] text-slate-400">
            Kertas A4 (210 × 297 mm) • Skala Cetak 100%
          </span>
        </div>

        {/* Paper Container Mockup */}
        <div className="overflow-x-auto flex justify-center p-4 bg-slate-200/60 rounded-3xl border border-slate-300">
          <div
            ref={printSheetRef}
            className="print-sheet bg-white shadow-2xl p-[10mm] text-slate-900 mx-auto"
            style={{
              width: "210mm",
              minHeight: "297mm",
              boxSizing: "border-box",
            }}
          >
            {selectedStudents.length === 0 ? (
              <div className="h-[270mm] flex flex-col items-center justify-center text-slate-400 space-y-2">
                <FileText className="w-12 h-12 text-slate-300 stroke-1" />
                <p className="font-bold text-sm text-slate-600">
                  Belum ada siswa yang dipilih untuk dicetak
                </p>
                <p className="text-xs text-slate-400">
                  Pilih siswa di atas untuk melihat layout lembar cetak
                </p>
              </div>
            ) : (
              /* A4 Grid 2 Kolom x N Baris */
              <div
                className="grid grid-cols-2 gap-x-[8mm] gap-y-[6mm] justify-items-center"
                style={{
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                }}
              >
                {selectedStudents.map((st) => (
                  <div
                    key={st.id}
                    className="relative flex flex-col items-center"
                    style={{
                      padding: showCropMarks ? "2mm" : "0",
                      border: showCropMarks ? "1px dashed #cbd5e1" : "none",
                    }}
                  >
                    {/* Front Side */}
                    {(cardSide === "FRONT" || cardSide === "BOTH") && (
                      <div className="relative">
                        <StudentCardFront
                          school={school}
                          student={st}
                          major={st.major}
                        />
                      </div>
                    )}

                    {/* Back Side */}
                    {cardSide === "BACK" && (
                      <div className="relative">
                        <StudentCardBack
                          school={school}
                          student={st}
                          major={st.major}
                        />
                      </div>
                    )}

                    {/* Both Sides stacked or paired */}
                    {cardSide === "BOTH" && (
                      <div className="mt-[4mm]">
                        <StudentCardBack
                          school={school}
                          student={st}
                          major={st.major}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

