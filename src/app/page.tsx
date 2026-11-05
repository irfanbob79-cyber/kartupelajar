import Link from "next/link";
import { db } from "@/lib/db";
import {
  Users,
  Camera,
  Printer,
  CheckCircle2,
  FileSpreadsheet,
  Palette,
  ArrowRight,
  Sparkles,
  QrCode,
  ShieldCheck,
} from "lucide-react";
import StudentCardFlipper from "@/components/card/StudentCardFlipper";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const school = await db.schoolProfile.findFirst();
  const totalStudents = await db.student.count();
  const studentsWithPhoto = await db.student.count({
    where: { photoUrl: { not: null } },
  });
  const studentsWithoutPhoto = totalStudents - studentsWithPhoto;
  const printedStudents = await db.student.count({
    where: { isPrinted: true },
  });

  const majors = await db.major.findMany({
    include: {
      _count: {
        select: { students: true },
      },
    },
    orderBy: { code: "asc" },
  });

  const recentStudents = await db.student.findMany({
    take: 5,
    include: { major: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 rounded-2xl p-6 text-white shadow-xl shadow-blue-900/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-medium text-blue-200 mb-2 border border-white/15">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Sistem Kartu Pelajar Digital Standar CR80</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            {school?.schoolName ?? "SMK NEGERI 1 LABUHAN MARINGGAI"}
          </h1>
          <p className="text-blue-100/90 text-sm mt-1">
            Tahun Ajaran {school?.academicYear ?? "2026/2027"} • NPSN: {school?.npsn ?? "10806050"} • {school?.cityIssued ?? "Lampung Timur"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/siswa/import"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-sm transition-colors border border-white/20 backdrop-blur-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
            <span>Import Excel</span>
          </Link>
          <Link
            href="/cetak"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-500/30"
          >
            <Printer className="w-4 h-4" />
            <span>Studio Cetak</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Siswa
            </span>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-slate-900 tracking-tight">
              {totalStudents}
            </span>
            <span className="text-xs text-slate-500 ml-2">siswa terdaftar</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-blue-600 font-medium">
            <Link href="/siswa" className="hover:underline flex items-center gap-1">
              Lihat semua data siswa <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Foto Lengkap
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-slate-900 tracking-tight">
              {studentsWithPhoto}
            </span>
            <span className="text-xs text-emerald-600 ml-2 font-medium">
              ({totalStudents > 0 ? Math.round((studentsWithPhoto / totalStudents) * 100) : 0}%)
            </span>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Siap untuk digenerate kartu fisiknya
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Belum Ada Foto
            </span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
              <Camera className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-slate-900 tracking-tight">
              {studentsWithoutPhoto}
            </span>
            <span className="text-xs text-slate-500 ml-2">siswa</span>
          </div>
          <div className="mt-3 text-xs text-amber-600 font-medium">
            Perlu upload foto / capture webcam
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Kartu Sudah Dicetak
            </span>
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
              <Printer className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-bold text-slate-900 tracking-tight">
              {printedStudents}
            </span>
            <span className="text-xs text-indigo-600 ml-2 font-medium">
              kartu terverifikasi
            </span>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Status tanda cetak terdata di sistem
          </p>
        </div>
      </div>

      {/* 2-Columns Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Jurusan & Recent Students (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Jurusan Breakdown */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Daftar Program Keahlian / Jurusan
                </h2>
                <p className="text-xs text-slate-500">
                  Setiap jurusan memiliki tema visual & kartu yang disesuaikan
                </p>
              </div>
              <Link
                href="/template"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                Atur Tema <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {majors.map((m) => (
                <div
                  key={m.id}
                  className="p-4 rounded-xl border border-slate-100 hover:border-slate-200 transition-all flex items-center justify-between"
                  style={{
                    borderLeftWidth: "4px",
                    borderLeftColor: m.themeColor,
                  }}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">
                        {m.code}
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs text-slate-600 truncate max-w-[160px]">
                        {m.name}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 mt-1 inline-block">
                      {m._count.students} Siswa terdaftar
                    </span>
                  </div>
                  <div
                    className="w-4 h-4 rounded-full border border-white shadow-sm shrink-0"
                    style={{ backgroundColor: m.themeColor }}
                    title={`Tema: ${m.themeColor}`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Recent Students Table */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Siswa Terdaftar Terakhir
                </h2>
                <p className="text-xs text-slate-500">
                  Daftar siswa terbaru yang siap dicetak kartunya
                </p>
              </div>
              <Link
                href="/siswa"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                Kelola Semua <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase">
                    <th className="pb-3">NIS/NISN</th>
                    <th className="pb-3">Nama Lengkap</th>
                    <th className="pb-3">Jurusan</th>
                    <th className="pb-3">Status Foto</th>
                    <th className="pb-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentStudents.map((st) => (
                    <tr key={st.id} className="hover:bg-slate-50/60">
                      <td className="py-3 font-mono font-medium text-slate-700">
                        {st.nis}
                        <span className="block text-[10px] text-slate-400">
                          {st.nisn}
                        </span>
                      </td>
                      <td className="py-3 font-semibold text-slate-900">
                        {st.fullName}
                      </td>
                      <td className="py-3">
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white inline-block"
                          style={{ backgroundColor: st.major.themeColor }}
                        >
                          {st.major.code}
                        </span>
                      </td>
                      <td className="py-3">
                        {st.photoUrl ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                            <CheckCircle2 className="w-3 h-3" /> Ada Foto
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 font-medium">
                            <Camera className="w-3 h-3" /> Belum Ada
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        <Link
                          href={`/cetak?nis=${st.nis}`}
                          className="text-blue-600 hover:text-blue-800 font-semibold text-xs"
                        >
                          Preview Kartu
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: ID Card Preview Card (CR80 Visual Representation) */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col items-center">
            <div className="w-full flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Preview Standar Kartu CR80
              </span>
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px]">
                54 × 86 mm
              </span>
            </div>

            {/* Interactive Physical Card Mockup (Portrait CR80) */}
            {recentStudents[0] ? (
              <StudentCardFlipper
                school={{
                  schoolName: school?.schoolName || "SMK NEGERI 1 LABUHAN MARINGGAI",
                  academicYear: school?.academicYear || "2026/2027",
                  logoLeftUrl: school?.logoLeftUrl || "/images/logo-sekolah.png",
                  website: school?.website || "www.smkn1labuhanmaringgai.sch.id",
                  address: school?.address || "Jl. Raya Maringgai No. 1, Labuhan Maringgai",
                  phone: school?.phone || "(0725) 7654321",
                  principalName: school?.principalName || "Drs. H. Ahmad Dahlan, M.Pd.",
                  principalNip: school?.principalNip || "19750817 200003 1 004",
                  cityIssued: school?.cityIssued || "Labuhan Maringgai",
                  signatureUrl: school?.signatureUrl || null,
                  stampUrl: school?.stampUrl || null,
                }}
                student={{
                  nis: recentStudents[0].nis,
                  nisn: recentStudents[0].nisn,
                  fullName: recentStudents[0].fullName,
                  birthPlace: recentStudents[0].birthPlace,
                  birthDate: recentStudents[0].birthDate,
                  address: recentStudents[0].address,
                  photoUrl: recentStudents[0].photoUrl,
                  validUntil: recentStudents[0].validUntil,
                }}
                major={{
                  code: recentStudents[0].major.code,
                  name: recentStudents[0].major.name,
                  themeColor: recentStudents[0].major.themeColor,
                  accentColor: recentStudents[0].major.accentColor,
                  backgroundFrontUrl: recentStudents[0].major.backgroundFrontUrl,
                  backgroundBackUrl: recentStudents[0].major.backgroundBackUrl,
                  showPhotoBorder: recentStudents[0].major.showPhotoBorder,
                  photoStyle: recentStudents[0].major.photoStyle,
                  footerStyle: recentStudents[0].major.footerStyle,
                  footerLeftMode: recentStudents[0].major.footerLeftMode,
                  footerLogoUrl: recentStudents[0].major.footerLogoUrl,
                }}
              />
            ) : null}

            <div className="mt-4 w-full space-y-2">
              <Link
                href="/template"
                className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Palette className="w-3.5 h-3.5 text-blue-600" />
                <span>Kustomisasi Desain & Tema</span>
              </Link>
            </div>
          </div>

          {/* Quick Info Box */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/80 text-amber-900">
            <div className="flex items-center gap-2 font-bold text-xs mb-1">
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              <span>Standar Ukuran Cetak Teruji</span>
            </div>
            <p className="text-[11px] text-amber-800/90 leading-relaxed">
              Format output PDF telah dikalibrasi presisi sesuai ukuran kartu fisik CR80 (54 × 86 mm) untuk cetak langsung ke printer PVC tray atau kertas A4 siap potong.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
