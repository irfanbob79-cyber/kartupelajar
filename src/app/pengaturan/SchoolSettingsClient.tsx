"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  School,
  Save,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  FileSignature,
  Stamp,
  ShieldCheck,
} from "lucide-react";
import { updateSchoolProfile, SchoolProfileData } from "@/app/actions/school";

export default function SchoolSettingsClient({
  initialProfile,
}: {
  initialProfile: SchoolProfileData;
}) {
  const router = useRouter();
  const [formData, setFormData] = useState<SchoolProfileData>(initialProfile);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle generic file upload for logo/signature/stamp
  const handleUploadAsset = async (
    field: "logoLeftUrl" | "logoRightUrl" | "signatureUrl" | "stampUrl",
    file: File
  ) => {
    try {
      setLoading(true);
      setError(null);
      const data = new FormData();
      data.append("file", file);
      data.append("identifier", field);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: data,
      });

      const json = await res.json();
      if (json.success) {
        setFormData((prev) => ({ ...prev, [field]: json.url }));
      } else {
        setError(json.error || "Gagal mengunggah gambar aset");
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await updateSchoolProfile(formData);
      if (res.success) {
        setSuccess(true);
        router.refresh();
      } else {
        setError(res.error || "Gagal menyimpan perubahan");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <School className="w-7 h-7 text-blue-600" />
            <span>Pengaturan Profil & Identitas Sekolah</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Data kop resmi, informasi kontak, serta tanda tangan & stempel pengesahan kartu
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition-all disabled:opacity-50"
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : success ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{loading ? "Menyimpan..." : success ? "Berhasil Disimpan!" : "Simpan Profil Sekolah"}</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Profil sekolah berhasil diperbarui. Perubahan telah diterapkan ke seluruh template kartu.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Identitas Utama */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            Identitas & Kop Resmi Sekolah
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Lengkap Sekolah *
              </label>
              <input
                type="text"
                required
                value={formData.schoolName}
                onChange={(e) =>
                  setFormData({ ...formData, schoolName: e.target.value })
                }
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                NPSN (Nomor Pokok Sekolah Nasional) *
              </label>
              <input
                type="text"
                required
                value={formData.npsn}
                onChange={(e) => setFormData({ ...formData, npsn: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tahun Ajaran / Pelajaran *
              </label>
              <input
                type="text"
                required
                placeholder="2026/2027"
                value={formData.academicYear}
                onChange={(e) =>
                  setFormData({ ...formData, academicYear: e.target.value })
                }
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Alamat Lengkap Sekolah
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nomor Telepon
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Website Resmi Sekolah
              </label>
              <input
                type="text"
                value={formData.website}
                onChange={(e) =>
                  setFormData({ ...formData, website: e.target.value })
                }
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Pengesahan Kepala Sekolah & Stempel */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            Otorisasi, Tanda Tangan & Stempel Resmi
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Lengkap Kepala Sekolah *
              </label>
              <input
                type="text"
                required
                value={formData.principalName}
                onChange={(e) =>
                  setFormData({ ...formData, principalName: e.target.value })
                }
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                NIP / NUPTK Kepala Sekolah *
              </label>
              <input
                type="text"
                required
                value={formData.principalNip}
                onChange={(e) =>
                  setFormData({ ...formData, principalNip: e.target.value })
                }
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kota / Titimangsa Penerbitan Kartu
              </label>
              <input
                type="text"
                placeholder="Contoh: Labuhan Maringgai"
                value={formData.cityIssued}
                onChange={(e) =>
                  setFormData({ ...formData, cityIssued: e.target.value })
                }
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Upload Tanda Tangan & Stempel */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
            {/* Tanda Tangan */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <FileSignature className="w-4 h-4 text-blue-600" />
                <span>Tanda Tangan Kepala Sekolah (PNG Transparan)</span>
              </div>
              <div className="h-24 rounded-lg bg-white border border-dashed border-slate-300 flex items-center justify-center p-2">
                {formData.signatureUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={formData.signatureUrl}
                    alt="TTD"
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <span className="text-xs text-slate-400">Belum ada berkas</span>
                )}
              </div>
              <input
                type="file"
                accept="image/png, image/webp"
                id="ttdInput"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleUploadAsset("signatureUrl", f);
                }}
                className="hidden"
              />
              <label
                htmlFor="ttdInput"
                className="w-full py-2 px-3 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Unggah Berkas Tanda Tangan</span>
              </label>
            </div>

            {/* Stempel Sekolah */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Stamp className="w-4 h-4 text-blue-600" />
                <span>Stempel Basah Sekolah (PNG Transparan)</span>
              </div>
              <div className="h-24 rounded-lg bg-white border border-dashed border-slate-300 flex items-center justify-center p-2">
                {formData.stampUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={formData.stampUrl}
                    alt="Stempel"
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <span className="text-xs text-slate-400">Belum ada berkas</span>
                )}
              </div>
              <input
                type="file"
                accept="image/png, image/webp"
                id="stempelInput"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleUploadAsset("stampUrl", f);
                }}
                className="hidden"
              />
              <label
                htmlFor="stempelInput"
                className="w-full py-2 px-3 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Unggah Berkas Stempel</span>
              </label>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

