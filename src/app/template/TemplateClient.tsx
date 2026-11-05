"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Palette,
  Check,
  RefreshCw,
  Sparkles,
  Layers,
  Save,
  CheckCircle2,
  Image as ImageIcon,
  Upload,
  Trash2,
  Copy,
  Info,
  Square,
  Barcode,
  Type,
  School as SchoolIcon,
} from "lucide-react";
import StudentCardFlipper from "@/components/card/StudentCardFlipper";
import { updateMajorTheme, applyBackgroundToAllMajors } from "@/app/actions/major";
import { updateSchoolProfile } from "@/app/actions/school";

interface Major {
  id: string;
  code: string;
  name: string;
  themeColor: string;
  accentColor: string;
  backgroundFrontUrl?: string | null;
  backgroundBackUrl?: string | null;
  showPhotoBorder?: boolean;
  photoStyle?: string;
  footerStyle?: string;
  footerLeftMode?: string;
  footerLogoUrl?: string | null;
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

interface Student {
  id: string;
  nis: string;
  nisn: string;
  fullName: string;
  birthPlace: string;
  birthDate: string;
  address: string;
  photoUrl?: string | null;
  validUntil: string;
  majorId: string;
}

const PRESET_PALETTES = [
  { name: "Blue Royal & Amber", theme: "#1E40AF", accent: "#F59E0B" },
  { name: "Emerald & Gold", theme: "#065F46", accent: "#D97706" },
  { name: "Orange Industrial & Slate", theme: "#C2410C", accent: "#475569" },
  { name: "Teal Tech & Sky", theme: "#0F766E", accent: "#0284C7" },
  { name: "Purple Elegance & Pink", theme: "#6B21A8", accent: "#EC4899" },
  { name: "Crimson Maroon & Amber", theme: "#881337", accent: "#F59E0B" },
];

export default function TemplateClient({
  majors,
  school,
  sampleStudents,
}: {
  majors: Major[];
  school: School;
  sampleStudents: Student[];
}) {
  const router = useRouter();
  const [selectedMajorId, setSelectedMajorId] = useState(majors[0]?.id || "");
  const currentMajor =
    majors.find((m) => m.id === selectedMajorId) || majors[0];

  const [schoolState, setSchoolState] = useState<School>(school);

  const [themeColor, setThemeColor] = useState(currentMajor.themeColor);
  const [accentColor, setAccentColor] = useState(currentMajor.accentColor);
  const [backgroundFrontUrl, setBackgroundFrontUrl] = useState<string | null>(
    currentMajor.backgroundFrontUrl || null
  );
  const [backgroundBackUrl, setBackgroundBackUrl] = useState<string | null>(
    currentMajor.backgroundBackUrl || null
  );
  const [showPhotoBorder, setShowPhotoBorder] = useState<boolean>(
    Boolean(currentMajor.showPhotoBorder)
  );
  const [photoStyle, setPhotoStyle] = useState<string>(
    currentMajor.photoStyle || "SEAMLESS"
  );
  const [footerStyle, setFooterStyle] = useState<string>(
    currentMajor.footerStyle === "BOX" ? "BOX" : "CLEAN"
  );
  const [footerLeftMode, setFooterLeftMode] = useState<string>(
    currentMajor.footerLeftMode || "TEXT"
  );
  const [footerLogoUrl, setFooterLogoUrl] = useState<string | null>(
    currentMajor.footerLogoUrl || "/images/smk-bisa-hebat.jpg"
  );

  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingBg, setIsUploadingBg] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [applyAllSuccess, setApplyAllSuccess] = useState(false);

  const fileInputFrontRef = useRef<HTMLInputElement | null>(null);
  const fileInputBackRef = useRef<HTMLInputElement | null>(null);
  const fileInputLogoRef = useRef<HTMLInputElement | null>(null);
  const fileInputSchoolLogoRef = useRef<HTMLInputElement | null>(null);

  // Sync state when major changes
  const handleSelectMajor = (id: string) => {
    setSelectedMajorId(id);
    const m = majors.find((item) => item.id === id);
    if (m) {
      setThemeColor(m.themeColor);
      setAccentColor(m.accentColor);
      setBackgroundFrontUrl(m.backgroundFrontUrl || null);
      setBackgroundBackUrl(m.backgroundBackUrl || null);
      setShowPhotoBorder(Boolean(m.showPhotoBorder));
      setPhotoStyle(m.photoStyle || "SEAMLESS");
      setFooterStyle(m.footerStyle === "BOX" ? "BOX" : "CLEAN");
      setFooterLeftMode(m.footerLeftMode || "TEXT");
      setFooterLogoUrl(m.footerLogoUrl || "/images/smk-bisa-hebat.jpg");
    }
    setSaveSuccess(false);
    setApplyAllSuccess(false);
  };

  // Find a student of this major to preview, or fallback to first student
  const previewStudent =
    sampleStudents.find((s) => s.majorId === selectedMajorId) ||
    sampleStudents[0] || {
      id: "preview",
      nis: "2425001",
      nisn: "0078912345",
      fullName: "ANDI PRATAMA",
      birthPlace: "Lampung Timur",
      birthDate: "14 Mei 2008",
      address: "Jl. Lintas Pantai Timur No. 12, Labuhan Maringgai",
      photoUrl: null,
      validUntil: "Juli 2027",
      majorId: selectedMajorId,
    };

  // Upload Custom Background Image (Front or Back)
  const handleUploadBg = async (
    type: "front" | "back",
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingBg(true);
    setSaveSuccess(false);
    try {
      const data = new FormData();
      data.append("file", file);
      data.append("identifier", `bg_${type}_${currentMajor.code}`);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: data,
      });

      const json = await res.json();
      if (json.success && json.url) {
        if (type === "front") {
          setBackgroundFrontUrl(json.url);
        } else {
          setBackgroundBackUrl(json.url);
        }
      } else {
        alert("Gagal mengunggah gambar latar: " + (json.error || ""));
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsUploadingBg(false);
    }
  };

  // Upload Custom School Logo (Pojok Kiri Atas Kop)
  const handleUploadSchoolLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = new FormData();
      data.append("file", file);
      data.append("identifier", "logo_sekolah");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: data,
      });

      const json = await res.json();
      if (json.success && json.url) {
        setSchoolState((prev) => ({ ...prev, logoLeftUrl: json.url }));
        await updateSchoolProfile({
          ...schoolState,
          logoLeftUrl: json.url,
        });
        router.refresh();
      }
    } catch (err: any) {
      alert("Gagal mengunggah logo sekolah: " + err.message);
    }
  };

  // Upload Custom Footer Logo
  const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = new FormData();
      data.append("file", file);
      data.append("identifier", `logo_footer_${currentMajor.code}`);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: data,
      });

      const json = await res.json();
      if (json.success && json.url) {
        setFooterLogoUrl(json.url);
        setSaveSuccess(false);
      }
    } catch (err: any) {
      alert("Gagal mengunggah logo footer: " + err.message);
    }
  };

  // Save changes for this major
  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setApplyAllSuccess(false);
    try {
      const res = await updateMajorTheme(
        selectedMajorId,
        themeColor,
        accentColor,
        backgroundFrontUrl,
        backgroundBackUrl,
        showPhotoBorder,
        photoStyle,
        footerStyle,
        footerLeftMode,
        footerLogoUrl
      );
      if (res.success) {
        setSaveSuccess(true);
        router.refresh();
      } else {
        alert("Gagal menyimpan tema: " + res.error);
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Apply current background & styles to ALL majors
  const handleApplyToAll = async () => {
    if (
      !confirm(
        "Apakah Anda yakin ingin menerapkan seluruh pengaturan tema, latar, gaya foto, dan footer ini ke SEMUA program keahlian / jurusan?"
      )
    ) {
      return;
    }

    setIsSaving(true);
    try {
      const res = await applyBackgroundToAllMajors(
        backgroundFrontUrl,
        backgroundBackUrl,
        showPhotoBorder,
        photoStyle,
        footerStyle,
        footerLeftMode,
        footerLogoUrl
      );
      if (res.success) {
        setApplyAllSuccess(true);
        router.refresh();
        alert("Pengaturan berhasil diterapkan ke seluruh jurusan!");
      } else {
        alert("Gagal menerapkan ke semua jurusan: " + res.error);
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Palette className="w-7 h-7 text-blue-600" />
            <span>Desainer Template & Tema Kartu</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Sesuaikan identitas warna tema, ornamen, pas foto tanpa bingkai, footer tematik, dan logo resmi
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving || isUploadingBg}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition-all disabled:opacity-50"
        >
          {isSaving ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : saveSuccess ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>
            {isSaving
              ? "Menyimpan..."
              : saveSuccess
              ? "Tersimpan!"
              : "Simpan Konfigurasi Tema"}
          </span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Configuration Panels (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Major Selector */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Pilih Program Keahlian / Jurusan:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {majors.map((m) => {
                const isSelected = m.id === selectedMajorId;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => handleSelectMajor(m.id)}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? "border-blue-600 bg-blue-50/60 shadow-xs ring-2 ring-blue-500/20"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm text-slate-900">
                        {m.code}
                      </span>
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: m.themeColor }}
                      />
                    </div>
                    <span className="text-[11px] text-slate-500 mt-2 truncate">
                      {m.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* LOGO SEKOLAH (POJOK KIRI ATAS KOP KARTU) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <SchoolIcon className="w-4 h-4 text-blue-600" />
                  <span>Logo Sekolah (Pojok Kiri Atas Kop)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Logo resmi sekolah yang tampil di dalam lingkaran pada kop kartu bagian atas
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div className="w-14 h-14 rounded-full bg-white border border-slate-300 p-1 flex items-center justify-center shadow-xs shrink-0 overflow-hidden">
                {schoolState.logoLeftUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={schoolState.logoLeftUrl}
                    alt="Logo Sekolah"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-xs font-black text-amber-500">ID</span>
                )}
              </div>

              <div className="space-y-1">
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  ref={fileInputSchoolLogoRef}
                  onChange={handleUploadSchoolLogo}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputSchoolLogoRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs"
                >
                  <Upload className="w-3.5 h-3.5 text-blue-600" />
                  <span>Ganti Logo Sekolah</span>
                </button>
                <p className="text-[10px] text-slate-400">
                  Format PNG transparan rekomendasi (Logo SMKN 1 Labuhan Maringgai aktif)
                </p>
              </div>
            </div>
          </div>

          {/* GAYA FOOTER KARTU (WARNA TEMA, TEKS KARTU SISWA, DAN LOGO RESMI) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Palette className="w-4 h-4 text-blue-600" />
                <span>Pengaturan Footer Kartu (Bagian Bawah)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Kustomisasi warna tema footer, ganti barcode dengan teks &quot;Kartu Siswa&quot;, serta logo resmi
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* 1. Gaya Tampilan Header & Footer */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Gaya Header &amp; Footer Kartu:
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => {
                      setFooterStyle("CLEAN");
                      setSaveSuccess(false);
                    }}
                    className={`py-2 px-2 rounded-lg border text-center transition-all ${
                      footerStyle === "CLEAN" || (footerStyle !== "BOX" && footerStyle !== "THEME_BOX")
                        ? "bg-blue-600 border-blue-600 text-white shadow-xs font-bold"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    ✨ Clean (Tanpa Kotak)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFooterStyle("BOX");
                      setSaveSuccess(false);
                    }}
                    className={`py-2 px-2 rounded-lg border text-center transition-all ${
                      footerStyle === "BOX" || footerStyle === "THEME_BOX"
                        ? "bg-blue-600 border-blue-600 text-white shadow-xs font-bold"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    ⏹️ Blok Kotak Klasik
                  </button>
                </div>
              </div>

              {/* 2. Format Sisi Kiri Footer (Teks Kartu Siswa vs Barcode) */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Format Sisi Kiri Footer:
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => {
                      setFooterLeftMode("TEXT");
                      setSaveSuccess(false);
                    }}
                    className={`py-2 px-2.5 rounded-lg border text-center transition-all flex items-center justify-center gap-1.5 ${
                      footerLeftMode === "TEXT"
                        ? "bg-blue-600 border-blue-600 text-white shadow-xs"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <Type className="w-3.5 h-3.5" />
                    <span>Teks &quot;Kartu Siswa&quot;</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFooterLeftMode("BARCODE");
                      setSaveSuccess(false);
                    }}
                    className={`py-2 px-2.5 rounded-lg border text-center transition-all flex items-center justify-center gap-1.5 ${
                      footerLeftMode === "BARCODE"
                        ? "bg-blue-600 border-blue-600 text-white shadow-xs"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <Barcode className="w-3.5 h-3.5" />
                    <span>Barcode Fisik</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 3. Logo Sisi Kanan Footer (Gambar SMK BISA HEBAT) */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  Logo Sisi Kanan Footer (Gambar SMK BISA - HEBAT):
                </span>
                {footerLogoUrl !== "/images/smk-bisa-hebat.jpg" && (
                  <button
                    type="button"
                    onClick={() => {
                      setFooterLogoUrl("/images/smk-bisa-hebat.jpg");
                      setSaveSuccess(false);
                    }}
                    className="text-[11px] text-blue-600 hover:underline font-medium"
                  >
                    Kembalikan Logo Default
                  </button>
                )}
              </div>

              <div className="flex items-center gap-4">
                <div className="h-12 w-28 bg-slate-900 border border-slate-700 rounded-lg p-1.5 flex items-center justify-center shadow-xs">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={footerLogoUrl || "/images/smk-bisa-hebat.jpg"}
                    alt="Logo Footer"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>

                <div className="space-y-1">
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    ref={fileInputLogoRef}
                    onChange={handleUploadLogo}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputLogoRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs"
                  >
                    <Upload className="w-3.5 h-3.5 text-blue-600" />
                    <span>Ganti Gambar Logo</span>
                  </button>
                  <p className="text-[10px] text-slate-400">
                    Format PNG transparan akan menyatu tanpa kotak putih
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* GAYA PAS FOTO (BINGKAI ON/OFF & SEAMLESS ELEGAN) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Gaya Pas Foto Siswa (Bingkai & Transparansi)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pilih tampilan pas foto: tanpa bingkai menyatu elegan (seamless) atau bingkai kotak standar
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Opsi 1: Tanpa Bingkai (Seamless Elegan) */}
              <button
                type="button"
                onClick={() => {
                  setShowPhotoBorder(false);
                  setPhotoStyle("SEAMLESS");
                  setSaveSuccess(false);
                }}
                className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3 ${
                  !showPhotoBorder
                    ? "border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20 shadow-xs"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div
                  className={`p-2 rounded-lg shrink-0 ${
                    !showPhotoBorder ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-slate-900">
                      Elegan Tanpa Bingkai
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[9px] font-black uppercase">
                      Rekomendasi
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    Foto menyatu dengan latar kartu secara transparan tanpa kotak kaku, mepet dengan nama siswa.
                  </p>
                </div>
              </button>

              {/* Opsi 2: Dengan Bingkai Standar */}
              <button
                type="button"
                onClick={() => {
                  setShowPhotoBorder(true);
                  setPhotoStyle("FRAMED");
                  setSaveSuccess(false);
                }}
                className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3 ${
                  showPhotoBorder
                    ? "border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20 shadow-xs"
                    : "border-slate-200 hover:border-slate-300 bg-white"
                }`}
              >
                <div
                  className={`p-2 rounded-lg shrink-0 ${
                    showPhotoBorder ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  <Square className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-slate-900">
                      Bingkai Pas Foto Standar
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    Pas foto di dalam kotak bingkai resmi rasio 3:4 dengan garis border warna aksen emas/oranye.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* CUSTOM BACKGROUND UPLOAD SECTION */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-blue-600" />
                  <span>Foto Latar Belakang Kartu (Custom Background)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Unggah foto gedung sekolah, ornamen arsitektur, atau latar visual kustom
                </p>
              </div>

              {backgroundFrontUrl && (
                <button
                  type="button"
                  onClick={handleApplyToAll}
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold transition-colors shadow-2xs"
                  title="Terapkan foto latar ini ke semua jurusan sekaligus"
                >
                  <Copy className="w-3.5 h-3.5 text-blue-600" />
                  <span>Terapkan ke Semua Jurusan</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Sisi Depan Background */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    Latar Sisi Depan (Front)
                  </span>
                  {backgroundFrontUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setBackgroundFrontUrl(null);
                        setSaveSuccess(false);
                      }}
                      className="text-[11px] text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Hapus
                    </button>
                  )}
                </div>

                <div className="h-28 rounded-lg bg-white border border-dashed border-slate-300 flex items-center justify-center p-2 relative overflow-hidden group">
                  {backgroundFrontUrl ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={backgroundFrontUrl}
                        alt="Latar Depan"
                        className="w-full h-full object-cover rounded"
                      />
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-xs font-semibold">
                          Klik tombol di bawah untuk mengganti
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-2 text-slate-400">
                      <ImageIcon className="w-8 h-8 mx-auto stroke-1" />
                      <span className="text-[11px] block mt-1 font-medium">
                        Belum ada foto latar
                      </span>
                    </div>
                  )}
                </div>

                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  ref={fileInputFrontRef}
                  onChange={(e) => handleUploadBg("front", e)}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputFrontRef.current?.click()}
                  disabled={isUploadingBg}
                  className="w-full py-2 px-3 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                >
                  <Upload className="w-3.5 h-3.5 text-blue-600" />
                  <span>
                    {isUploadingBg
                      ? "Mengunggah..."
                      : backgroundFrontUrl
                      ? "Ganti Foto Latar Depan"
                      : "Unggah Foto Latar Depan"}
                  </span>
                </button>
              </div>

              {/* Sisi Belakang Background */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
                    Latar Sisi Belakang (Back)
                  </span>
                  {backgroundBackUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setBackgroundBackUrl(null);
                        setSaveSuccess(false);
                      }}
                      className="text-[11px] text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Hapus
                    </button>
                  )}
                </div>

                <div className="h-28 rounded-lg bg-white border border-dashed border-slate-300 flex items-center justify-center p-2 relative overflow-hidden group">
                  {backgroundBackUrl ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={backgroundBackUrl}
                        alt="Latar Belakang"
                        className="w-full h-full object-cover rounded"
                      />
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-xs font-semibold">
                          Klik tombol di bawah untuk mengganti
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-2 text-slate-400">
                      <ImageIcon className="w-8 h-8 mx-auto stroke-1" />
                      <span className="text-[11px] block mt-1 font-medium">
                        Otomatis mengikuti latar depan
                      </span>
                    </div>
                  )}
                </div>

                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  ref={fileInputBackRef}
                  onChange={(e) => handleUploadBg("back", e)}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputBackRef.current?.click()}
                  disabled={isUploadingBg}
                  className="w-full py-2 px-3 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                >
                  <Upload className="w-3.5 h-3.5 text-blue-600" />
                  <span>
                    {isUploadingBg
                      ? "Mengunggah..."
                      : backgroundBackUrl
                      ? "Ganti Foto Latar Belakang"
                      : "Unggah Foto Latar Belakang"}
                  </span>
                </button>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200/80 text-blue-900 text-xs flex items-start gap-2.5">
              <Info className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
              <div className="leading-relaxed text-[11px]">
                <strong>Tips Pasang Foto Latar:</strong> Anda bisa memotret gedung sekolah, gerbang, atau logo air (*watermark*). Sistem otomatis mengatur transparansi harmonis (~25%) agar teks nama siswa, biodata, dan teks kartu tetap tajam dan mudah dipindai.
              </div>
            </div>
          </div>

          {/* Color Palettes & Pickers */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Warna Tema & Aksen Kartu [{currentMajor.code}]
              </h3>
              <p className="text-xs text-slate-500">
                Pilih kombinasi palet siap pakai atau atur kode warna HEX kustom
              </p>
            </div>

            {/* Presets */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">
                Preset Palet Warna Harmonis:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {PRESET_PALETTES.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setThemeColor(preset.theme);
                      setAccentColor(preset.accent);
                      setSaveSuccess(false);
                    }}
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 flex items-center gap-2.5 text-left bg-slate-50/50 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex -space-x-1">
                      <div
                        className="w-5 h-5 rounded-full border border-white shadow-2xs"
                        style={{ backgroundColor: preset.theme }}
                      />
                      <div
                        className="w-5 h-5 rounded-full border border-white shadow-2xs"
                        style={{ backgroundColor: preset.accent }}
                      />
                    </div>
                    <span className="text-[11px] font-medium text-slate-800 truncate">
                      {preset.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Color Pickers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Warna Primer / Kop Kartu (Theme)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={themeColor}
                    onChange={(e) => {
                      setThemeColor(e.target.value);
                      setSaveSuccess(false);
                    }}
                    className="w-10 h-10 rounded-lg border-0 cursor-pointer p-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={themeColor}
                    onChange={(e) => {
                      setThemeColor(e.target.value);
                      setSaveSuccess(false);
                    }}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 font-mono text-xs font-semibold uppercase"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Warna Aksen / Border Foto (Accent)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => {
                      setAccentColor(e.target.value);
                      setSaveSuccess(false);
                    }}
                    className="w-10 h-10 rounded-lg border-0 cursor-pointer p-0 bg-transparent"
                  />
                  <input
                    type="text"
                    value={accentColor}
                    onChange={(e) => {
                      setAccentColor(e.target.value);
                      setSaveSuccess(false);
                    }}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 font-mono text-xs font-semibold uppercase"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Live Interactive Card Preview (5 cols) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-start space-y-4">
          <div className="w-full bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col items-center">
            <div className="w-full flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Pratinjau Nyata Standar CR80
              </span>
              <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-full">
                {currentMajor.code}
              </span>
            </div>

            {/* Card Flipper Component with Live School Logo & All Options */}
            <StudentCardFlipper
              school={schoolState}
              student={previewStudent}
              major={{
                ...currentMajor,
                themeColor,
                accentColor,
                backgroundFrontUrl,
                backgroundBackUrl,
                showPhotoBorder,
                photoStyle,
                footerStyle,
                footerLeftMode,
                footerLogoUrl,
              }}
            />

            <p className="text-[11px] text-slate-400 mt-3 text-center">
              Klik pada kartu atau tombol di atas untuk melihat sisi depan & belakang
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
