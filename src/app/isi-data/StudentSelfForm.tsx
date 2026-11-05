"use client";

import { useState, useRef } from "react";
import {
  Camera,
  Upload,
  CheckCircle2,
  AlertCircle,
  Search,
  User,
  Sparkles,
  School,
  IdCard,
  RefreshCw,
  Send,
} from "lucide-react";
import StudentCardFront from "@/components/card/StudentCardFront";
import {
  checkStudentByIdentifier,
  submitStudentSelfData,
} from "@/app/actions/student-portal";

interface Major {
  id: string;
  code: string;
  name: string;
  themeColor: string;
  accentColor: string;
  backgroundFrontUrl?: string | null;
  footerStyle?: string;
  footerLeftMode?: string;
  footerLogoUrl?: string | null;
  showPhotoBorder?: boolean;
}

interface School {
  schoolName: string;
  academicYear: string;
  logoLeftUrl?: string | null;
}

export default function StudentSelfForm({
  majors,
  school,
}: {
  majors: Major[];
  school: School;
}) {
  const [identifier, setIdentifier] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchStatus, setSearchStatus] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    nis: "",
    nisn: "",
    fullName: "",
    birthPlace: "",
    birthDate: "",
    gender: "L",
    address: "",
    majorId: majors[0]?.id || "",
    photoUrl: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const selectedMajor =
    majors.find((m) => m.id === formData.majorId) || majors[0];

  // Search existing student
  const handleCheckStudent = async () => {
    if (!identifier.trim()) {
      setErrorMessage("Masukkan NIS atau NISN Anda terlebih dahulu");
      return;
    }

    setIsSearching(true);
    setErrorMessage(null);
    setSearchStatus(null);

    try {
      const res = await checkStudentByIdentifier(identifier);
      if (res.found && res.student) {
        const s = res.student;
        setFormData({
          nis: s.nis,
          nisn: s.nisn,
          fullName: s.fullName,
          birthPlace: s.birthPlace,
          birthDate: s.birthDate,
          gender: s.gender || "L",
          address: s.address,
          majorId: s.majorId || majors[0]?.id || "",
          photoUrl: s.photoUrl || "",
        });
        setSearchStatus(
          `Data ditemukan: ${s.fullName}. Silakan periksa atau lengkapi pas foto dan alamat Anda.`
        );
      } else {
        setFormData((prev) => ({
          ...prev,
          nis: identifier,
          nisn: "",
        }));
        setSearchStatus(
          "NIS/NISN belum terdaftar. Silakan isi formulir biodata lengkap di bawah."
        );
      }
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsSearching(false);
    }
  };

  // Upload Photo (supports mobile camera capture directly!)
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    setErrorMessage(null);

    try {
      const data = new FormData();
      data.append("file", file);
      data.append("identifier", formData.nis || "siswa");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: data,
      });

      const json = await res.json();
      if (json.success && json.url) {
        setFormData((prev) => ({ ...prev, photoUrl: json.url }));
      } else {
        setErrorMessage(json.error || "Gagal mengunggah foto");
      }
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  // Submit Data
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.nis || !formData.nisn || !formData.fullName) {
      setErrorMessage("NIS, NISN, dan Nama Lengkap wajib diisi!");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitStudentSelfData(formData);
      if (res.success) {
        setSubmitSuccess(true);
      } else {
        setErrorMessage(res.error || "Gagal menyimpan biodata");
      }
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 flex flex-col items-center">
      {/* Top Header Card */}
      <div className="w-full max-w-3xl bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 flex items-center justify-center shrink-0">
            {school.logoLeftUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={school.logoLeftUrl}
                alt="Logo Sekolah"
                className="max-h-full max-w-full object-contain drop-shadow-sm"
              />
            ) : (
              <School className="w-8 h-8 text-blue-600" />
            )}
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              Portal Siswa Mandiri
            </span>
            <h1 className="text-base sm:text-lg font-black text-slate-900 leading-tight mt-0.5">
              {school.schoolName}
            </h1>
            <p className="text-xs text-slate-500">
              Formulir Pas Foto & Biodata Kartu Tanda Siswa (T.A {school.academicYear})
            </p>
          </div>
        </div>
      </div>

      {submitSuccess ? (
        /* Success Screen */
        <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-md border border-slate-200 text-center space-y-5 animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">
              Biodata Berhasil Terkirim!
            </h2>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Terima kasih <strong>{formData.fullName}</strong>. Data dan foto Anda sudah masuk ke pangkalan data sekolah dan siap dicetak menjadi Kartu Pelajar resmi.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">NIS:</span>
              <span className="font-mono font-bold text-slate-800">{formData.nis}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Jurusan:</span>
              <span className="font-bold text-blue-700">{selectedMajor.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Status Foto:</span>
              <span className="font-bold text-emerald-600">Sudah Terunggah ✓</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setSubmitSuccess(false);
              setIdentifier("");
              setSearchStatus(null);
              setFormData({
                nis: "",
                nisn: "",
                fullName: "",
                birthPlace: "",
                birthDate: "",
                gender: "L",
                address: "",
                majorId: majors[0]?.id || "",
                photoUrl: "",
              });
            }}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all"
          >
            Isi Data Siswa Lain
          </button>
        </div>
      ) : (
        /* Main Interactive Form with Live Card Preview */
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Input Form (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200/80 space-y-6">
            {/* Step 1: Search NIS/NISN */}
            <div className="space-y-2 pb-5 border-b border-slate-100">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                1. Masukkan NIS atau NISN Anda:
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Contoh: 2425001 atau 0078912345"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleCheckStudent}
                  disabled={isSearching}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shrink-0 disabled:opacity-50"
                >
                  {isSearching ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  <span>Cek Data</span>
                </button>
              </div>

              {searchStatus && (
                <p className="text-[11px] text-blue-700 font-medium bg-blue-50 p-2.5 rounded-xl border border-blue-200">
                  {searchStatus}
                </p>
              )}
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Step 2: Photo Section */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  2. Pas Foto Siswa (Kamera HP / Upload):
                </label>
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="w-20 h-26 rounded-xl bg-white border-2 border-dashed border-slate-300 flex items-center justify-center shrink-0 overflow-hidden relative shadow-xs">
                    {formData.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={formData.photoUrl}
                        alt="Pas Foto"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-2 text-slate-400">
                        <Camera className="w-7 h-7 mx-auto stroke-1" />
                        <span className="text-[8px] block mt-1 font-medium">FOTO</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingPhoto}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>
                          {isUploadingPhoto
                            ? "Mengunggah..."
                            : formData.photoUrl
                            ? "Ganti Foto"
                            : "Ambil / Unggah Foto"}
                        </span>
                      </button>
                      {formData.photoUrl && (
                        <button
                          type="button"
                          onClick={() => setFormData((p) => ({ ...p, photoUrl: "" }))}
                          className="text-xs text-red-600 hover:underline px-2 py-1 font-medium"
                        >
                          Hapus
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      Gunakan seragam sekolah dengan pencahayaan terang. Latar belakang polos disarankan.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 3: Biodata Fields */}
              <div className="space-y-4 pt-2">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  3. Lengkapi Biodata Diri:
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      NIS (Nomor Induk Siswa) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: 2425001"
                      value={formData.nis}
                      onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      NISN (Nasional) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: 0078912345"
                      value={formData.nisn}
                      onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nama Lengkap Siswa *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: SITI NURHALIZA"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tempat Lahir
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Bandar Lampung"
                      value={formData.birthPlace}
                      onChange={(e) =>
                        setFormData({ ...formData, birthPlace: e.target.value })
                      }
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tanggal Lahir
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: 22 Agustus 2008"
                      value={formData.birthDate}
                      onChange={(e) =>
                        setFormData({ ...formData, birthDate: e.target.value })
                      }
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Program Keahlian / Jurusan *
                    </label>
                    <select
                      value={formData.majorId}
                      onChange={(e) =>
                        setFormData({ ...formData, majorId: e.target.value })
                      }
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium"
                    >
                      {majors.map((m) => (
                        <option key={m.id} value={m.id}>
                          [{m.code}] {m.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Jenis Kelamin
                    </label>
                    <div className="flex items-center gap-4 pt-1">
                      <label className="flex items-center gap-1.5 text-xs font-medium cursor-pointer">
                        <input
                          type="radio"
                          name="gender"
                          value="L"
                          checked={formData.gender === "L"}
                          onChange={(e) =>
                            setFormData({ ...formData, gender: e.target.value })
                          }
                          className="text-blue-600"
                        />
                        <span>Laki-laki (L)</span>
                      </label>
                      <label className="flex items-center gap-1.5 text-xs font-medium cursor-pointer">
                        <input
                          type="radio"
                          name="gender"
                          value="P"
                          checked={formData.gender === "P"}
                          onChange={(e) =>
                            setFormData({ ...formData, gender: e.target.value })
                          }
                          className="text-blue-600"
                        />
                        <span>Perempuan (P)</span>
                      </label>
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Alamat Tinggal Lengkap
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Dusun Sukamaju RT 02/01, Desa Karang Anyar"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={isSubmitting || isUploadingPhoto}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>{isSubmitting ? "Menyimpan Data..." : "Kirim Biodata & Foto Saya"}</span>
                </button>
                <p className="text-center text-[10px] text-slate-400 mt-2">
                  Data Anda langsung tersimpan di sistem sekolah dan hanya dapat dicetak oleh Operator TU.
                </p>
              </div>
            </form>
          </div>

          {/* Right: Real-time Live Card Preview (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="sticky top-6 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col items-center w-full">
              <div className="w-full flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Pratinjau Kartu Pelajar Anda
                </span>
                <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-full">
                  {selectedMajor.code}
                </span>
              </div>

              {/* Student Card Front Live */}
              <StudentCardFront
                school={{
                  schoolName: school.schoolName,
                  academicYear: school.academicYear,
                  logoLeftUrl: school.logoLeftUrl,
                }}
                student={{
                  nis: formData.nis || "2425...",
                  nisn: formData.nisn || "0078...",
                  fullName: formData.fullName || "NAMA LENGKAP SISWA",
                  birthPlace: formData.birthPlace || "Kota Lahir",
                  birthDate: formData.birthDate || "01 Januari 2008",
                  address: formData.address || "Alamat Siswa",
                  photoUrl: formData.photoUrl || null,
                  validUntil: "Juli 2027",
                }}
                major={selectedMajor}
              />

              <p className="text-[11px] text-slate-400 mt-3 text-center">
                Tampilan kartu akan berubah otomatis saat Anda mengisi data & foto di sebelah kiri
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

