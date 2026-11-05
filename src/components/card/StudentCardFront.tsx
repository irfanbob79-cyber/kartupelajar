"use client";

import BarcodeCode128 from "./BarcodeCode128";
import { User } from "lucide-react";

interface StudentCardFrontProps {
  school: {
    schoolName: string;
    academicYear: string;
    logoLeftUrl?: string | null;
    logoRightUrl?: string | null;
  };
  student: {
    nis: string;
    nisn: string;
    fullName: string;
    birthPlace: string;
    birthDate: string;
    address: string;
    photoUrl?: string | null;
    validUntil?: string;
  };
  major: {
    code: string;
    name: string;
    themeColor: string;
    accentColor: string;
    backgroundFrontUrl?: string | null;
    showPhotoBorder?: boolean;
    photoStyle?: string;
    footerStyle?: string;
    footerLeftMode?: string;
    footerLogoUrl?: string | null;
  };
  className?: string;
}

export default function StudentCardFront({
  school,
  student,
  major,
  className = "",
}: StudentCardFrontProps) {
  const themeColor = major.themeColor || "#1E40AF";
  const accentColor = major.accentColor || "#F59E0B";
  const showPhotoBorder = Boolean(major.showPhotoBorder);
  
  // Clean style (tanpa kotak header dan footer) adalah DEFAULT.
  // Hanya tampil dengan kotak jika disetel eksplisit ke "BOX" atau "THEME_BOX".
  const isBoxed = major.footerStyle === "BOX" || major.footerStyle === "THEME_BOX";
  const isThemeFooter = major.footerStyle === "THEME_BOX" || major.footerStyle === "THEME";
  const isTextMode = major.footerLeftMode !== "BARCODE";
  const logoUrl = major.footerLogoUrl || "/images/smk-bisa-hebat.jpg";

  return (
    <div
      className={`card-cr80-front relative w-[240px] h-[382px] rounded-xl overflow-hidden shadow-xl border border-slate-300 bg-white select-none flex flex-col justify-between ${className}`}
      style={{
        width: "240px",
        height: "382px",
        boxSizing: "border-box",
      }}
    >
      {/* Background Graphic Layer */}
      {major.backgroundFrontUrl ? (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30 pointer-events-none"
          style={{ backgroundImage: `url(${major.backgroundFrontUrl})` }}
        />
      ) : (
        <div
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            background: `radial-gradient(circle at 100% 0%, ${themeColor} 0%, transparent 60%), radial-gradient(circle at 0% 100%, ${accentColor} 0%, transparent 50%)`,
          }}
        />
      )}

      {/* ========================================================
         TOP KOP KARTU (CLEAN TANPA KOTAK VS BLOK KOTAK KLASIK)
         ======================================================== */}
      {isBoxed ? (
        <div
          className="relative z-10 px-3 py-2 text-white"
          style={{
            background: `linear-gradient(135deg, ${themeColor} 0%, #0f172a 100%)`,
            borderBottom: `2px solid ${accentColor}`,
          }}
        >
          <div className="flex items-center gap-2 mb-0.5">
            <div className="w-10 h-10 flex items-center justify-center shrink-0">
              {school.logoLeftUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={school.logoLeftUrl}
                  alt="Logo Sekolah"
                  className="max-w-full max-h-full object-contain drop-shadow-md"
                />
              ) : (
                <span className="text-[10px] font-black text-amber-300">ID</span>
              )}
            </div>
            <div className="flex-1 text-left pl-0.5">
              <span
                className="text-[7.5px] font-black tracking-widest uppercase block"
                style={{ color: accentColor }}
              >
                KARTU TANDA SISWA
              </span>
              <h2 className="text-[8.5px] font-black uppercase text-white leading-tight tracking-tight">
                {school.schoolName}
              </h2>
              <div className="text-[6.5px] font-semibold text-slate-200 tracking-wider mt-0.5">
                TAHUN PELAJARAN {school.academicYear}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* CLEAN HEADER: Tanpa Kotak Berwarna & Tanpa Garis Pembatas Kaku */
        <div className="relative z-10 px-3.5 pt-3 pb-1">
          <div className="flex items-center gap-2.5">
            {/* Logo Sekolah Resmi (Bebas, Tanpa Kotak & Tanpa Lingkaran Putih) */}
            <div className="w-11 h-11 flex items-center justify-center shrink-0">
              {school.logoLeftUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={school.logoLeftUrl}
                  alt="Logo Sekolah"
                  className="max-w-full max-h-full object-contain drop-shadow-xs"
                />
              ) : (
                <span className="text-[11px] font-black" style={{ color: themeColor }}>ID</span>
              )}
            </div>

            {/* Teks Kop Kartu (Clean & Elegan) */}
            <div className="flex-1 text-left">
              <span
                className="text-[7px] font-black tracking-widest uppercase block leading-none"
                style={{ color: accentColor }}
              >
                KARTU TANDA SISWA
              </span>
              <h2 className="text-[9px] font-black uppercase text-slate-900 leading-tight tracking-tight mt-0.5">
                {school.schoolName}
              </h2>
              <div className="text-[6.5px] font-bold text-slate-500 tracking-wider mt-0.5">
                TAHUN PELAJARAN {school.academicYear}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
         CENTER: PAS FOTO & DATA SISWA
         ======================================================== */}
      <div className="relative z-10 flex-1 px-3.5 pt-0 pb-1 flex flex-col items-center justify-between">
        {!showPhotoBorder ? (
          /* ========================================================
             STYLE 1: ELEGAN TANPA BINGKAI (FOTO MEPET DENGAN NAMA)
             ======================================================== */
          <>
            {/* Group: Photo + Name + Major (Mepet / Tightly Connected) */}
            <div className="flex flex-col items-center w-full">
              {/* Seamless Transparent Photo Container */}
              <div className="relative w-[138px] h-[146px] flex items-center justify-center overflow-hidden bg-transparent shrink-0">
                {student.photoUrl ? (
                  <div className="relative w-full h-full flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={student.photoUrl}
                      alt={student.fullName}
                      className="w-full h-full object-contain [mask-image:linear-gradient(to_bottom,black_85%,transparent_100%)] drop-shadow-sm scale-105"
                    />
                  </div>
                ) : (
                  <div className="text-center p-2 text-slate-400">
                    <User className="w-14 h-14 mx-auto stroke-1 text-slate-300" />
                    <span className="text-[7.5px] block font-medium mt-1">PAS FOTO</span>
                  </div>
                )}
              </div>

              {/* Nama Siswa Mepet Langsung di Bawah Foto (-mt-3.5) */}
              <div className="text-center w-full px-1 -mt-3.5 z-10">
                <h3 className="text-[12.5px] font-black uppercase text-slate-950 tracking-wide leading-tight truncate drop-shadow-xs">
                  {student.fullName}
                </h3>
                <div className="mt-0.5">
                  <span
                    className="inline-block px-3 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider text-white shadow-xs"
                    style={{
                      backgroundColor: themeColor,
                      border: `1px solid ${accentColor}`,
                    }}
                  >
                    {major.name}
                  </span>
                </div>
              </div>
            </div>

            {/* Compact Clean Data Table */}
            <div className="w-full bg-white/90 backdrop-blur-xs rounded-lg px-2.5 py-1.5 border border-slate-200/90 text-[7.5px] font-medium text-slate-800 space-y-0.5 shadow-xs mb-0.5">
              <div className="flex">
                <span className="w-12 text-slate-500 font-bold shrink-0">NIS / NISN</span>
                <span className="font-mono font-bold text-slate-900">: {student.nis} / {student.nisn}</span>
              </div>
              <div className="flex">
                <span className="w-12 text-slate-500 font-bold shrink-0">TGL. LAHIR</span>
                <span className="truncate text-slate-900 font-semibold">: {student.birthPlace}, {student.birthDate}</span>
              </div>
              <div className="flex">
                <span className="w-12 text-slate-500 font-bold shrink-0">ALAMAT</span>
                <span className="truncate text-slate-900 font-semibold">: {student.address}</span>
              </div>
            </div>
          </>
        ) : (
          /* ========================================================
             STYLE 2: DENGAN BINGKAI STANDAR
             ======================================================== */
          <>
            {/* Framed Photo */}
            <div
              className="w-22 h-28 rounded-md bg-slate-100 border-2 overflow-hidden shadow-md flex items-center justify-center relative shrink-0 mt-0.5"
              style={{ borderColor: accentColor }}
            >
              {student.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={student.photoUrl}
                  alt={student.fullName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-2 text-slate-400">
                  <User className="w-8 h-8 mx-auto stroke-1" />
                  <span className="text-[7px] block font-medium">PAS FOTO</span>
                </div>
              )}
            </div>

            {/* Major Pill */}
            <div
              className="px-2.5 py-0.5 rounded-full text-white font-black text-[8px] tracking-wide shadow-xs mt-0.5"
              style={{ backgroundColor: themeColor }}
            >
              {major.code} • {major.name}
            </div>

            {/* Data Siswa Table */}
            <div className="w-full bg-slate-50/90 backdrop-blur-xs rounded-lg p-2 border border-slate-200/80 text-[7.5px] font-medium text-slate-800 space-y-0.5 shadow-2xs">
              <div className="flex">
                <span className="w-13 text-slate-500 font-semibold shrink-0">NAMA</span>
                <span className="font-extrabold text-slate-950 truncate">: {student.fullName}</span>
              </div>
              <div className="flex">
                <span className="w-13 text-slate-500 font-semibold shrink-0">NIS / NISN</span>
                <span className="font-mono">: {student.nis} / {student.nisn}</span>
              </div>
              <div className="flex">
                <span className="w-13 text-slate-500 font-semibold shrink-0">TGL. LAHIR</span>
                <span className="truncate">: {student.birthPlace}, {student.birthDate}</span>
              </div>
              <div className="flex">
                <span className="w-13 text-slate-500 font-semibold shrink-0">ALAMAT</span>
                <span className="truncate">: {student.address}</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ========================================================
         FOOTER KARTU (CLEAN TANPA KOTAK VS BLOK KOTAK KLASIK)
         ======================================================== */}
      {isBoxed ? (
        <div
          className="relative z-10 px-3 py-1.5 flex items-center justify-between"
          style={{
            background: isThemeFooter
              ? `linear-gradient(135deg, ${themeColor} 0%, #0f172a 100%)`
              : "#ffffff",
            borderTop: isThemeFooter
              ? `2px solid ${accentColor}`
              : "1px solid #e2e8f0",
          }}
        >
          {isTextMode ? (
            <div className="flex flex-col items-start justify-center">
              <span
                className={`text-[9.5px] font-black tracking-widest uppercase drop-shadow-xs ${
                  isThemeFooter ? "text-white" : "text-slate-900"
                }`}
              >
                KARTU SISWA
              </span>
              <span
                className={`text-[6.5px] font-mono font-bold tracking-wider ${
                  isThemeFooter ? "text-amber-300" : "text-blue-700"
                }`}
              >
                NIS. {student.nis}
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-start">
              <div className="h-5.5 overflow-hidden flex items-center bg-white px-1 rounded-xs">
                <BarcodeCode128
                  value={student.nis || "2425001"}
                  width={1.0}
                  height={18}
                  fontSize={6}
                  displayValue={false}
                />
              </div>
              <span
                className={`font-mono text-[6px] font-bold tracking-wider mt-0.5 ${
                  isThemeFooter ? "text-slate-300" : "text-slate-700"
                }`}
              >
                *{student.nis}*
              </span>
            </div>
          )}

          <div className="flex flex-col items-end justify-center shrink-0">
            <div className="h-8 max-w-[100px] flex items-center justify-end overflow-hidden bg-transparent">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoUrl}
                alt="SMK BISA - HEBAT"
                className="max-h-full max-w-full object-contain drop-shadow-sm"
              />
            </div>
            <span
              className={`text-[6px] font-semibold mt-0.5 tracking-tight ${
                isThemeFooter ? "text-slate-200" : "text-slate-500"
              }`}
            >
              Berlaku: {student.validUntil || "Juli 2027"}
            </span>
          </div>
        </div>
      ) : (
        /* CLEAN FOOTER: Tanpa Kotak & Tanpa Garis Pembatas */
        <div className="relative z-10 px-3.5 pb-2.5 pt-0.5 flex items-center justify-between bg-transparent">
          {/* Sisi Kiri: Teks "KARTU SISWA" atau Barcode */}
          {isTextMode ? (
            <div className="flex flex-col items-start justify-center">
              <span
                className="text-[9.5px] font-black tracking-widest uppercase"
                style={{ color: themeColor }}
              >
                KARTU SISWA
              </span>
              <span className="text-[6.5px] font-mono font-bold tracking-wider text-slate-600">
                NIS. {student.nis}
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-start">
              <div className="h-5.5 overflow-hidden flex items-center bg-white px-1 rounded-xs border border-slate-200">
                <BarcodeCode128
                  value={student.nis || "2425001"}
                  width={1.0}
                  height={18}
                  fontSize={6}
                  displayValue={false}
                />
              </div>
              <span className="font-mono text-[6px] font-bold tracking-wider mt-0.5 text-slate-600">
                *{student.nis}*
              </span>
            </div>
          )}

          {/* Sisi Kanan: Gambar Resmi Logo SMK BISA HEBAT (100% Transparan) */}
          <div className="flex flex-col items-end justify-center shrink-0">
            <div className="h-8.5 max-w-[105px] flex items-center justify-end overflow-hidden bg-transparent">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoUrl}
                alt="SMK BISA - HEBAT"
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <span className="text-[6px] font-semibold mt-0.5 tracking-tight text-slate-500">
              Berlaku: {student.validUntil || "Juli 2027"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
