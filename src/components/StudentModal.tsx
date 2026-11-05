"use client";

import { useState, useRef, useEffect } from "react";
import {
  X,
  Camera,
  Upload,
  RefreshCw,
  Check,
  AlertCircle,
  User,
  Sparkles,
} from "lucide-react";
import { createStudent, updateStudent } from "@/app/actions/student";

interface Major {
  id: string;
  code: string;
  name: string;
}

interface StudentData {
  id?: string;
  nis: string;
  nisn: string;
  fullName: string;
  birthPlace: string;
  birthDate: string;
  gender: string;
  address: string;
  majorId: string;
  validUntil: string;
  photoUrl?: string | null;
}

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  majors: Major[];
  initialData?: StudentData | null;
  onSuccess?: () => void;
}

export default function StudentModal({
  isOpen,
  onClose,
  majors,
  initialData,
  onSuccess,
}: StudentModalProps) {
  const [formData, setFormData] = useState<StudentData>({
    nis: "",
    nisn: "",
    fullName: "",
    birthPlace: "",
    birthDate: "",
    gender: "L",
    address: "",
    majorId: majors[0]?.id || "",
    validUntil: "Juli 2027",
    photoUrl: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Webcam states
  const [isWebcamOpen, setIsWebcamOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        nis: initialData.nis || "",
        nisn: initialData.nisn || "",
        fullName: initialData.fullName || "",
        birthPlace: initialData.birthPlace || "",
        birthDate: initialData.birthDate || "",
        gender: initialData.gender || "L",
        address: initialData.address || "",
        majorId: initialData.majorId || majors[0]?.id || "",
        validUntil: initialData.validUntil || "Juli 2027",
        photoUrl: initialData.photoUrl || "",
      });
    } else {
      setFormData({
        nis: "",
        nisn: "",
        fullName: "",
        birthPlace: "",
        birthDate: "",
        gender: "L",
        address: "",
        majorId: majors[0]?.id || "",
        validUntil: "Juli 2027",
        photoUrl: "",
      });
    }
    setError(null);
  }, [initialData, majors, isOpen]);

  // Clean up webcam stream on unmount/close
  useEffect(() => {
    if (!isOpen && cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
      setIsWebcamOpen(false);
    }
  }, [isOpen, cameraStream]);

  if (!isOpen) return null;

  // Handle Webcam Start
  const startWebcam = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
      });
      setCameraStream(stream);
      setIsWebcamOpen(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      setError("Tidak dapat mengakses kamera: " + (err.message || "Izin ditolak"));
    }
  };

  // Stop Webcam
  const stopWebcam = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setIsWebcamOpen(false);
  };

  // Capture Photo from Webcam
  const capturePhoto = async () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    // Aspect ratio 3:4 crop
    const targetWidth = 480;
    const targetHeight = 640;
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      // Calculate crop from video center
      const videoRatio = video.videoWidth / video.videoHeight;
      const targetRatio = targetWidth / targetHeight;

      let sx, sy, sWidth, sHeight;
      if (videoRatio > targetRatio) {
        sHeight = video.videoHeight;
        sWidth = video.videoHeight * targetRatio;
        sx = (video.videoWidth - sWidth) / 2;
        sy = 0;
      } else {
        sWidth = video.videoWidth;
        sHeight = video.videoWidth / targetRatio;
        sx = 0;
        sy = (video.videoHeight - sHeight) / 2;
      }

      ctx.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, targetWidth, targetHeight);
      const base64 = canvas.toDataURL("image/jpeg", 0.9);

      // Upload captured photo
      try {
        setLoading(true);
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageBase64: base64,
            filename: formData.nis || "captured",
          }),
        });
        const json = await res.json();
        if (json.success) {
          setFormData((prev) => ({ ...prev, photoUrl: json.url }));
          stopWebcam();
        } else {
          setError(json.error || "Gagal mengunggah hasil jepretan");
        }
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = new FormData();
    data.append("file", file);
    data.append("identifier", formData.nis || "student");

    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: data,
      });
      const json = await res.json();
      if (json.success) {
        setFormData((prev) => ({ ...prev, photoUrl: json.url }));
      } else {
        setError(json.error || "Gagal mengunggah file foto");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.nis || !formData.nisn || !formData.fullName) {
      setError("NIS, NISN, dan Nama Lengkap wajib diisi!");
      return;
    }

    setLoading(true);
    try {
      if (formData.id) {
        const res = await updateStudent(formData.id, formData);
        if (!res.success) {
          setError(res.error || "Gagal memperbarui data");
          setLoading(false);
          return;
        }
      } else {
        const res = await createStudent(formData);
        if (!res.success) {
          setError(res.error || "Gagal menyimpan data");
          setLoading(false);
          return;
        }
      }

      stopWebcam();
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan sistem");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {formData.id ? "Edit Data Siswa" : "Tambah Siswa Baru"}
            </h2>
            <p className="text-xs text-slate-500">
              Lengkapi data identitas & pas foto siswa untuk pencetakan kartu
            </p>
          </div>
          <button
            onClick={() => {
              stopWebcam();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Photo Section */}
          <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            {/* Photo Box */}
            <div className="w-28 h-36 rounded-xl border-2 border-dashed border-slate-300 bg-white flex flex-col items-center justify-center relative overflow-hidden shrink-0 shadow-xs">
              {formData.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={formData.photoUrl}
                  alt="Pas Foto"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-2 text-slate-400">
                  <User className="w-10 h-10 mx-auto stroke-1" />
                  <span className="text-[10px] mt-1 block">Rasio 3:4</span>
                </div>
              )}
            </div>

            {/* Photo Action Buttons */}
            <div className="flex-1 space-y-2 w-full text-center sm:text-left">
              <span className="text-xs font-semibold text-slate-800 block">
                Pas Foto Siswa
              </span>
              <p className="text-[11px] text-slate-500">
                Gunakan latar belakang polos (merah/biru). Format JPG, PNG, atau jepret langsung lewat webcam.
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1 justify-center sm:justify-start">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-2xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Pilih Berkas</span>
                </button>

                {!isWebcamOpen ? (
                  <button
                    type="button"
                    onClick={startWebcam}
                    disabled={loading}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors shadow-xs"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Jepret Webcam</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopWebcam}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-600 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
                  >
                    <span>Tutup Kamera</span>
                  </button>
                )}

                {formData.photoUrl && (
                  <button
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, photoUrl: null }))}
                    className="text-xs text-red-600 hover:text-red-700 px-2 py-1"
                  >
                    Hapus Foto
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Webcam Live Capture View */}
          {isWebcamOpen && (
            <div className="p-4 rounded-xl bg-slate-950 text-white border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                  Kamera Aktif - Posisikan wajah di dalam bingkai
                </span>
                <span className="text-[11px] text-slate-400">Rasio Otomatis 3:4</span>
              </div>

              <div className="relative w-full max-w-[320px] mx-auto rounded-lg overflow-hidden aspect-3/4 bg-black flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />
                {/* Oval guide for face alignment */}
                <div className="absolute inset-4 border-2 border-dashed border-amber-400/80 rounded-full pointer-events-none flex items-center justify-center">
                  <span className="text-[10px] text-amber-300/80 bg-black/40 px-2 py-0.5 rounded-full">
                    Garis Panduan Wajah
                  </span>
                </div>
              </div>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={capturePhoto}
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-transform active:scale-95"
                >
                  <Camera className="w-4 h-4" />
                  <span>Ambil Foto Sekarang</span>
                </button>
              </div>
            </div>
          )}

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
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
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Lengkap Siswa *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: ANDI PRATAMA"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tempat Lahir
              </label>
              <input
                type="text"
                placeholder="Contoh: Lampung Timur"
                value={formData.birthPlace}
                onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tanggal Lahir
              </label>
              <input
                type="text"
                placeholder="Contoh: 14 Mei 2008"
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Jurusan / Program Keahlian *
              </label>
              <select
                value={formData.majorId}
                onChange={(e) => setFormData({ ...formData, majorId: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-medium"
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
              <div className="flex items-center gap-4 pt-1.5">
                <label className="flex items-center gap-1.5 text-xs font-medium cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value="L"
                    checked={formData.gender === "L"}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span>Laki-laki (L)</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs font-medium cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value="P"
                    checked={formData.gender === "P"}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span>Perempuan (P)</span>
                </label>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Alamat Tinggal / Domisili
              </label>
              <input
                type="text"
                placeholder="Contoh: Jl. Lintas Pantai Timur No. 12, Labuhan Maringgai"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Masa Berlaku Kartu
              </label>
              <input
                type="text"
                placeholder="Contoh: Juli 2027"
                value={formData.validUntil}
                onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                stopWebcam();
                onClose();
              }}
              disabled={loading}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all shadow-md shadow-blue-500/25 disabled:opacity-50"
            >
              {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              <span>{formData.id ? "Simpan Perubahan" : "Simpan Siswa"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

