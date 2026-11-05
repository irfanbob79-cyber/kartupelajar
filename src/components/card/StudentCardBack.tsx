"use client";

import QRCodeCanvas from "./QRCodeCanvas";

interface StudentCardBackProps {
  school: {
    schoolName: string;
    npsn: string;
    address: string;
    phone: string;
    website: string;
    principalName: string;
    principalNip: string;
    cityIssued: string;
    signatureUrl?: string | null;
    stampUrl?: string | null;
  };
  student: {
    nis: string;
    nisn: string;
    fullName: string;
  };
  major: {
    themeColor: string;
    accentColor: string;
    backgroundBackUrl?: string | null;
    backgroundFrontUrl?: string | null;
    footerStyle?: string;
  };
  className?: string;
}

export default function StudentCardBack({
  school,
  student,
  major,
  className = "",
}: StudentCardBackProps) {
  const themeColor = major.themeColor || "#1E40AF";
  const accentColor = major.accentColor || "#F59E0B";
  const isBoxed = major.footerStyle === "BOX" || major.footerStyle === "THEME_BOX";

  // Verification URL or string
  const qrValue = `https://${school.website}/verify?nis=${student.nis}&nisn=${student.nisn}`;

  return (
    <div
      className={`card-cr80-back relative w-[240px] h-[382px] rounded-xl overflow-hidden shadow-xl border border-slate-300 bg-white select-none flex flex-col justify-between ${className}`}
      style={{
        width: "240px",
        height: "382px",
        boxSizing: "border-box",
      }}
    >
      {/* Background Graphic Layer */}
      {major.backgroundBackUrl || major.backgroundFrontUrl ? (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20 pointer-events-none"
          style={{
            backgroundImage: `url(${major.backgroundBackUrl || major.backgroundFrontUrl})`,
          }}
        />
      ) : (
        <div
          className="absolute inset-0 pointer-events-none opacity-5"
          style={{
            background: `radial-gradient(circle at 0% 0%, ${themeColor} 0%, transparent 70%), radial-gradient(circle at 100% 100%, ${accentColor} 0%, transparent 60%)`,
          }}
        />
      )}

      {/* TOP HEADER */}
      {isBoxed ? (
        <div
          className="relative z-10 px-3 py-2 text-center text-white"
          style={{
            backgroundColor: themeColor,
            borderBottom: `2px solid ${accentColor}`,
          }}
        >
          <h3 className="text-[9px] font-black tracking-wider uppercase">
            TATA TERTIB PENGGUNAAN KARTU
          </h3>
          <p className="text-[6.5px] text-blue-100">
            IDENTITAS RESMI SISWA/SISWI SEKOLAH
          </p>
        </div>
      ) : (
        <div className="relative z-10 px-3.5 pt-3 pb-1 text-center">
          <h3
            className="text-[9px] font-black tracking-wider uppercase"
            style={{ color: themeColor }}
          >
            TATA TERTIB PENGGUNAAN KARTU
          </h3>
          <p className="text-[6.5px] font-semibold text-slate-500 tracking-wider mt-0.5">
            IDENTITAS RESMI SISWA/SISWI SEKOLAH
          </p>
        </div>
      )}

      {/* RULES LIST */}
      <div className="relative z-10 px-3 py-1 flex-1 flex flex-col justify-between">
        <ol className="text-[6.8px] text-slate-700 space-y-1.5 list-decimal list-inside leading-tight font-medium">
          <li>
            Kartu ini merupakan tanda pengenal resmi siswa{" "}
            <strong>{school.schoolName}</strong>.
          </li>
          <li>Kartu tidak dapat dipindahtangankan kepada pihak lain.</li>
          <li>Wajib dibawa setiap hari saat kegiatan pembelajaran di sekolah.</li>
          <li>
            Jika kartu hilang/rusak, segera melapor ke bagian Tata Usaha Sekolah.
          </li>
          <li>
            Bagi yang menemukan kartu ini mohon mengembalikan ke alamat sekolah tertera.
          </li>
        </ol>

        {/* LEGALITAS / PENGESAHAN KEPALA SEKOLAH */}
        <div className="mt-2 pt-2 border-t border-slate-200/80 flex items-center justify-between">
          {/* QR Code Verifikasi */}
          <div className="flex flex-col items-center">
            <QRCodeCanvas value={qrValue} size={44} />
            <span className="text-[5.5px] font-mono text-slate-500 mt-0.5">
              Scan Verifikasi
            </span>
          </div>

          {/* Kolom Tanda Tangan & Stempel */}
          <div className="text-right flex-1 pl-2 relative">
            <div className="text-[6.5px] text-slate-600 font-medium">
              {school.cityIssued}, 15 Juli 2026
            </div>
            <div className="text-[7px] font-bold text-slate-900 leading-tight">
              Kepala Sekolah,
            </div>

            {/* Signature & Stamp Area (Simulasi & Gambar) */}
            <div className="h-10 relative flex items-center justify-end my-0.5">
              {/* Stempel Sekolah (Watermark Bulat Resmi) */}
              <div className="absolute right-6 w-9 h-9 rounded-full border border-blue-700/60 opacity-80 flex items-center justify-center p-0.5 pointer-events-none rotate-[-12deg]">
                {school.stampUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={school.stampUrl}
                    alt="Stempel"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full rounded-full border border-dashed border-blue-700/50 flex flex-col items-center justify-center text-[4px] font-bold text-blue-800 leading-none text-center">
                    <span>STEMPEL</span>
                    <span>RESMI</span>
                  </div>
                )}
              </div>

              {/* Tanda Tangan */}
              <div className="relative z-10 w-16 h-8 flex items-center justify-end">
                {school.signatureUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={school.signatureUrl}
                    alt="TTD"
                    className="max-h-full object-contain"
                  />
                ) : (
                  <div className="font-serif italic text-slate-700 text-[10px] tracking-wider pr-1">
                    {school.principalName.split(" ")[0]}
                  </div>
                )}
              </div>
            </div>

            {/* Nama & NIP */}
            <div className="text-[7px] font-black text-slate-950 underline leading-tight">
              {school.principalName}
            </div>
            <div className="text-[6px] font-mono text-slate-500">
              NIP. {school.principalNip}
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER ALAMAT SEKOLAH */}
      {isBoxed ? (
        <div className="relative z-10 px-3 py-1.5 bg-slate-900 text-slate-300 text-[6px] text-center border-t border-slate-800">
          <p className="font-semibold text-white truncate">{school.address}</p>
          <p className="text-slate-400 mt-0.5">
            Telp: {school.phone} • Web: {school.website}
          </p>
        </div>
      ) : (
        <div className="relative z-10 px-3 py-2 text-slate-600 text-[6px] text-center border-t border-slate-200/80 bg-slate-50/70">
          <p className="font-bold text-slate-800 truncate">{school.address}</p>
          <p className="text-slate-500 mt-0.5">
            Telp: {school.phone} • Web: {school.website}
          </p>
        </div>
      )}
    </div>
  );
}
