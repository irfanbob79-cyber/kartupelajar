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
  Scissors,
  ArrowLeft,
  RefreshCw,
  FileText,
  AlertTriangle,
  Layers,
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

  // Selection (default: first 9 students to fill exactly 1 sheet)
  const [selectedIds, setSelectedIds] = useState<string[]>(
    initialSelectedIds.length > 0
      ? initialSelectedIds
      : students.slice(0, 9).map((s) => s.id)
  );

  // Print Mode & Settings
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
    setSelectedIds(
      selectableStudents.filter((s) => !s.isPrinted).map((s) => s.id)
    );
  };

  const handleToggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Mark all selected as printed
  const handleMarkAsPrinted = async () => {
    if (
      confirm(`Tandai ${selectedStudents.length} siswa sebagai SUDAH DICETAK?`)
    ) {
      for (const st of selectedStudents) {
        await togglePrintStatus(st.id, true);
      }
      router.refresh();
      alert("Status cetak berhasil diperbarui di database!");
    }
  };

  // Browser Native Print
  const handleNativePrint = () => {
    window.print();
  };

  // Export PDF using jsPDF (loops through all pages of the 3x3 layout)
  const handleDownloadPdf = async () => {
    if (selectedStudents.length === 0) return;
    setIsExportingPdf(true);

    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pageElements = document.querySelectorAll<HTMLElement>(
        ".print-page-sheet"
      );

      if (pageElements.length === 0) {
        alert("Tidak ada lembar cetak yang dapat diekspor.");
        setIsExportingPdf(false);
        return;
      }

      for (let i = 0; i < pageElements.length; i++) {
        if (i > 0) {
          pdf.addPage("a4", "p");
        }

        const canvas = await html2canvas(pageElements[i], {
          scale: 2.5, // 300+ DPI equivalent
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff",
        });

        const imgData = canvas.toDataURL("image/jpeg", 0.98);
        pdf.addImage(imgData, "JPEG", 0, 0, 210, 297);
      }

      pdf.save(`Kartu_Pelajar_A4_Epson_${Date.now()}.pdf`);
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

  // Chunk selected students into groups of 9 cards per A4 page
  const pageChunks = useMemo(() => {
    const chunks: Student[][] = [];
    for (let i = 0; i < selectedStudents.length; i += 9) {
      chunks.push(selectedStudents.slice(i, i + 9));
    }
    return chunks;
  }, [selectedStudents]);

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
              <span>Studio Cetak Kartu Pelajar A4 (9 Kartu / Lembar)</span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Formasi Portrait DKV 3×3 (9 Kartu CR80 54 × 85.6 mm) dengan Margin Aman Bawah 3 cm untuk Penarik Printer Epson
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
              <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
            ) : (
              <Download className="w-4 h-4 text-blue-600" />
            )}
            <span>{isExportingPdf ? "Membuat PDF..." : "Unduh PDF (jsPDF High-Res)"}</span>
          </button>

          <button
            type="button"
            onClick={handleNativePrint}
            disabled={selectedStudents.length === 0}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition-all disabled:opacity-50"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Lembar A4 (Print Dialog)</span>
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
                className={`py-2 px-2 rounded-xl border text-center transition-all ${
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
                className={`py-2 px-2 rounded-xl border text-center transition-all ${
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
                className={`py-2 px-2 rounded-xl border text-center transition-all ${
                  cardSide === "BOTH"
                    ? "bg-blue-50 border-blue-600 text-blue-700 font-bold ring-2 ring-blue-500/20"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                Duplex (Keduanya)
              </button>
            </div>
          </div>

          {/* 2. Crop Marks Toggle */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Panduan Potong Kartu:
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
                <span>Crop Marks / Titik Potong</span>
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

        {/* Info Kalibrasi RFID 13.56 MHz (CR80) & Formasi DKV 9 Kartu */}
        <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200/80 text-blue-900 text-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700 shrink-0 mt-0.5">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-blue-950">
                Formasi Cetak Portrait DKV (9 Kartu per Lembar A4) • Standar RFID 13.56 MHz (CR80)
              </p>
              <p className="text-[11px] text-blue-700 mt-0.5 leading-relaxed">
                Dimensi kartu presisi <strong>54 mm × 85.6 mm</strong> (+ Bleed & Crop Marks). Dilengkapi margin aman bawah <strong>~3 cm</strong> di dasar lembar A4 agar roller penarik printer Epson (L805/L8050/L3110) tidak meleset atau menyebabkan blur di baris ke-3.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 self-end md:self-auto font-mono text-[10px]">
            <span className="bg-white px-2.5 py-1 rounded-lg border border-blue-200 text-blue-800 font-bold">
              3 Kolom × 3 Baris
            </span>
            <span className="bg-white px-2.5 py-1 rounded-lg border border-blue-200 text-blue-800 font-bold">
              Margin Bawah ~3 cm
            </span>
          </div>
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
              className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold"
            >
              Pilih Semua ({selectableStudents.length})
            </button>
            <button
              type="button"
              onClick={handleSelectUnprinted}
              className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold"
            >
              Pilih Belum Dicetak
            </button>
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className="px-3 py-1.5 rounded-lg text-red-600 hover:bg-red-50 font-semibold"
            >
              Batal Pilih
            </button>
          </div>
        </div>
      </div>

      {/* Selected Student Pill Checkboxes (no-print) */}
      <div className="no-print bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 block">
            Daftar Siswa untuk Dicetak ({selectedStudents.length} dipilih — {pageChunks.length} Lembar A4):
          </span>
          <span className="text-[11px] text-slate-400">
            Klik nama siswa untuk menambah / menghapus dari antrean cetak
          </span>
        </div>
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

      {/* WYSIWYG A4 PRINT SHEETS PREVIEW & PRINT ENGINE */}
      <div className="space-y-6">
        <div className="no-print flex items-center justify-between">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-blue-600" />
            <span>
              Pratinjau Lembar Cetak A4 ({pageChunks.length} Lembar • Total {selectedStudents.length} Kartu)
            </span>
          </span>
          <span className="text-[11px] text-slate-400">
            Kertas A4 (210 × 297 mm) • Skala Cetak 100% (Tanpa Fit/Shrink)
          </span>
        </div>

        {selectedStudents.length === 0 ? (
          <div className="no-print p-16 bg-white rounded-3xl border border-slate-200 text-center space-y-3">
            <FileText className="w-12 h-12 text-slate-300 stroke-1 mx-auto" />
            <p className="font-bold text-sm text-slate-700">
              Belum ada siswa yang dipilih untuk dicetak
            </p>
            <p className="text-xs text-slate-400">
              Silakan pilih siswa pada daftar di atas untuk memuat layout 9 kartu per lembar A4
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {pageChunks.map((chunk, pageIndex) => (
              <div key={pageIndex} className="space-y-2">
                <div className="no-print flex items-center justify-between px-2 text-xs font-bold text-slate-600">
                  <span>Lembar A4 Ke-{pageIndex + 1} ({chunk.length} / 9 Kartu)</span>
                  <span className="text-[11px] text-slate-400">
                    Formasi 3 Kolom × 3 Baris • Margin Bawah ~3 cm (Aman Epson)
                  </span>
                </div>

                {/* Single A4 Paper Container */}
                <div className="overflow-x-auto flex justify-center p-4 bg-slate-200/60 rounded-3xl border border-slate-300">
                  <div
                    className="print-page-sheet bg-white text-slate-900 relative shadow-2xl mx-auto"
                    style={{
                      width: "210mm",
                      height: "297mm",
                      minHeight: "297mm",
                      maxHeight: "297mm",
                      paddingTop: "8mm",
                      paddingLeft: "12mm",
                      paddingRight: "12mm",
                      paddingBottom: "30mm",
                      boxSizing: "border-box",
                      pageBreakAfter: "always",
                      breakAfter: "page",
                      overflow: "hidden",
                    }}
                  >
                    {/* Header Info (no-print) */}
                    <div className="no-print absolute top-1.5 left-3 text-[9px] text-slate-400 font-mono">
                      Lembar {pageIndex + 1} • {chunk.length} Kartu CR80 RFID (54 × 85.6 mm)
                    </div>

                    {/* 3x3 Card Grid (Width = 12 + 54 + 12 + 54 + 12 + 54 + 12 = 210mm) */}
                    <div
                      className="grid grid-cols-3 justify-items-center"
                      style={{
                        columnGap: "12mm",
                        rowGap: "1.2mm",
                        width: "186mm",
                        height: "258.8mm",
                      }}
                    >
                      {chunk.map((st) => (
                        <div
                          key={st.id}
                          className="relative flex items-center justify-center"
                          style={{
                            width: "54mm",
                            height: "85.6mm",
                            boxSizing: "border-box",
                          }}
                        >
                          {/* Corner Precision Crop Marks (L-shaped) */}
                          {showCropMarks && (
                            <>
                              {/* Top-Left */}
                              <div className="absolute -top-[2mm] -left-[2mm] w-[2mm] h-[2mm] pointer-events-none z-20">
                                <div className="absolute top-0 right-0 w-[0.3mm] h-full bg-slate-800" />
                                <div className="absolute bottom-0 right-0 w-full h-[0.3mm] bg-slate-800" />
                              </div>
                              {/* Top-Right */}
                              <div className="absolute -top-[2mm] -right-[2mm] w-[2mm] h-[2mm] pointer-events-none z-20">
                                <div className="absolute top-0 left-0 w-[0.3mm] h-full bg-slate-800" />
                                <div className="absolute bottom-0 left-0 w-full h-[0.3mm] bg-slate-800" />
                              </div>
                              {/* Bottom-Left */}
                              <div className="absolute -bottom-[2mm] -left-[2mm] w-[2mm] h-[2mm] pointer-events-none z-20">
                                <div className="absolute bottom-0 right-0 w-[0.3mm] h-full bg-slate-800" />
                                <div className="absolute top-0 right-0 w-full h-[0.3mm] bg-slate-800" />
                              </div>
                              {/* Bottom-Right */}
                              <div className="absolute -bottom-[2mm] -right-[2mm] w-[2mm] h-[2mm] pointer-events-none z-20">
                                <div className="absolute bottom-0 left-0 w-[0.3mm] h-full bg-slate-800" />
                                <div className="absolute top-0 left-0 w-full h-[0.3mm] bg-slate-800" />
                              </div>
                            </>
                          )}

                          {/* Card Content Scaled to 54mm x 85.6mm (CR80 Standard) */}
                          <div
                            className="w-[54mm] h-[85.6mm] overflow-hidden rounded-[2.5mm] relative bg-white"
                            style={{ boxSizing: "border-box" }}
                          >
                            <div
                              style={{
                                width: "240px",
                                height: "382px",
                                transform: "scale(0.8504)", // 240px * 0.8504 = 204.096px = 54.00mm
                                transformOrigin: "top left",
                              }}
                            >
                              {cardSide === "FRONT" || cardSide === "BOTH" ? (
                                <StudentCardFront
                                  school={school}
                                  student={st}
                                  major={st.major}
                                />
                              ) : (
                                <StudentCardBack
                                  school={school}
                                  student={st}
                                  major={st.major}
                                />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Batas Penarik Printer Epson (Margin Aman Bawah ~3 cm) */}
                    <div
                      className="epson-roller-guide absolute bottom-0 left-0 right-0 h-[30mm] border-t-2 border-dashed border-amber-400 bg-amber-50/80 flex flex-col items-center justify-center text-center p-2"
                      title="Margin Aman Bawah ~3 cm (30 mm) dikosongkan agar roller penarik printer Epson tidak meleset/blur"
                    >
                      <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Batas Penarik Printer Epson (Aman dari Blur / Meleset)</span>
                      </div>
                      <p className="text-[10px] text-amber-800/80 mt-0.5 font-medium">
                        Margin Aman Bawah ~3 cm • Dikosongkan khusus untuk kestabilan roller penarik kertas printer inkjet
                      </p>
                    </div>
                  </div>
                </div>

                {/* If Duplex is enabled, render Back Sheet right after Front Sheet */}
                {cardSide === "BOTH" && (
                  <div className="space-y-2 mt-4">
                    <div className="no-print flex items-center justify-between px-2 text-xs font-bold text-slate-600">
                      <span>Lembar A4 Ke-{pageIndex + 1} (Sisi Belakang Duplex)</span>
                      <span className="text-[11px] text-blue-600 font-semibold">
                        Posisi kolom dibalik horizontal agar pas saat kertas A4 dibalik
                      </span>
                    </div>

                    <div className="overflow-x-auto flex justify-center p-4 bg-slate-200/60 rounded-3xl border border-slate-300">
                      <div
                        className="print-page-sheet bg-white text-slate-900 relative shadow-2xl mx-auto"
                        style={{
                          width: "210mm",
                          height: "297mm",
                          minHeight: "297mm",
                          maxHeight: "297mm",
                          paddingTop: "8mm",
                          paddingLeft: "12mm",
                          paddingRight: "12mm",
                          paddingBottom: "30mm",
                          boxSizing: "border-box",
                          pageBreakAfter: "always",
                          breakAfter: "page",
                          overflow: "hidden",
                        }}
                      >
                        {/* 3x3 Card Grid for Back Side (reversing columns horizontally for 2-sided alignment) */}
                        <div
                          className="grid grid-cols-3 justify-items-center"
                          style={{
                            columnGap: "12mm",
                            rowGap: "1.2mm",
                            width: "186mm",
                            height: "258.8mm",
                          }}
                        >
                          {chunk.map((st) => (
                            <div
                              key={`back-${st.id}`}
                              className="relative flex items-center justify-center"
                              style={{
                                width: "54mm",
                                height: "85.6mm",
                                boxSizing: "border-box",
                              }}
                            >
                              {showCropMarks && (
                                <>
                                  <div className="absolute -top-[2mm] -left-[2mm] w-[2mm] h-[2mm] pointer-events-none z-20">
                                    <div className="absolute top-0 right-0 w-[0.3mm] h-full bg-slate-800" />
                                    <div className="absolute bottom-0 right-0 w-full h-[0.3mm] bg-slate-800" />
                                  </div>
                                  <div className="absolute -top-[2mm] -right-[2mm] w-[2mm] h-[2mm] pointer-events-none z-20">
                                    <div className="absolute top-0 left-0 w-[0.3mm] h-full bg-slate-800" />
                                    <div className="absolute bottom-0 left-0 w-full h-[0.3mm] bg-slate-800" />
                                  </div>
                                  <div className="absolute -bottom-[2mm] -left-[2mm] w-[2mm] h-[2mm] pointer-events-none z-20">
                                    <div className="absolute bottom-0 right-0 w-[0.3mm] h-full bg-slate-800" />
                                    <div className="absolute top-0 right-0 w-full h-[0.3mm] bg-slate-800" />
                                  </div>
                                  <div className="absolute -bottom-[2mm] -right-[2mm] w-[2mm] h-[2mm] pointer-events-none z-20">
                                    <div className="absolute bottom-0 left-0 w-[0.3mm] h-full bg-slate-800" />
                                    <div className="absolute top-0 left-0 w-full h-[0.3mm] bg-slate-800" />
                                  </div>
                                </>
                              )}

                              <div
                                className="w-[54mm] h-[85.6mm] overflow-hidden rounded-[2.5mm] relative bg-white"
                                style={{ boxSizing: "border-box" }}
                              >
                                <div
                                  style={{
                                    width: "240px",
                                    height: "382px",
                                    transform: "scale(0.8504)",
                                    transformOrigin: "top left",
                                  }}
                                >
                                  <StudentCardBack
                                    school={school}
                                    student={st}
                                    major={st.major}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="epson-roller-guide absolute bottom-0 left-0 right-0 h-[30mm] border-t-2 border-dashed border-amber-400 bg-amber-50/80 flex flex-col items-center justify-center text-center p-2">
                          <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs">
                            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>Batas Penarik Printer Epson (Aman dari Blur / Meleset)</span>
                          </div>
                          <p className="text-[10px] text-amber-800/80 mt-0.5 font-medium">
                            Margin Aman Bawah ~3 cm • Sisi Belakang Kartu
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
