"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import {
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  RefreshCw,
  Images,
  Info,
} from "lucide-react";
import { bulkImportStudents } from "@/app/actions/student";

interface Major {
  id: string;
  code: string;
  name: string;
}

interface ParsedRow {
  nis: string;
  nisn: string;
  fullName: string;
  birthPlace: string;
  birthDate: string;
  gender: string;
  majorCode: string;
  majorId?: string;
  address: string;
  validUntil: string;
  isValid: boolean;
  error?: string;
}

export default function ImportClient({ majors }: { majors: Major[] }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"excel" | "photos">("excel");

  // Excel state
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    count?: number;
    errors?: string[];
  } | null>(null);

  // Bulk photos state
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{
    total: number;
    completed: number;
    success: number;
  } | null>(null);

  // Generate & Download Excel Template
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        NIS: "2425005",
        NISN: "0078912349",
        NAMA_LENGKAP: "MUHAMMAD RIZKY PRATAMA",
        TEMPAT_LAHIR: "Lampung Timur",
        TANGGAL_LAHIR: "15 Juni 2008",
        JENIS_KELAMIN: "L",
        KODE_JURUSAN: "DKV",
        ALAMAT: "Desa Muara Gading Mas, Labuhan Maringgai",
        MASA_BERLAKU: "Juli 2027",
      },
      {
        NIS: "2425006",
        NISN: "0078912350",
        NAMA_LENGKAP: "AULIA RAHMADHANI",
        TEMPAT_LAHIR: "Bandar Lampung",
        TANGGAL_LAHIR: "28 Oktober 2008",
        JENIS_KELAMIN: "P",
        KODE_JURUSAN: "PBS",
        ALAMAT: "Jl. Lintas Timur KM 45, Labuhan Maringgai",
        MASA_BERLAKU: "Juli 2027",
      },
      {
        NIS: "2425007",
        NISN: "0078912351",
        NAMA_LENGKAP: "DIMAS SETIAWAN",
        TEMPAT_LAHIR: "Metro",
        TANGGAL_LAHIR: "04 Maret 2008",
        JENIS_KELAMIN: "L",
        KODE_JURUSAN: "TSM",
        ALAMAT: "Dusun Sinar Pasemah RT 01/02",
        MASA_BERLAKU: "Juli 2027",
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data_Siswa");

    // Add info sheet for major codes
    const majorInfo = majors.map((m) => ({
      KODE_JURUSAN: m.code,
      NAMA_JURUSAN: m.name,
    }));
    const infoSheet = XLSX.utils.json_to_sheet(majorInfo);
    XLSX.utils.book_append_sheet(workbook, infoSheet, "Daftar_Kode_Jurusan");

    XLSX.writeFile(workbook, "Template_Import_Siswa_KartuPelajar.xlsx");
  };

  // Handle Excel File Upload & Parse
  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const workbook = XLSX.read(bstr, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<any>(sheet);

        const majorMap = new Map(majors.map((m) => [m.code.toUpperCase(), m.id]));

        const rows: ParsedRow[] = jsonData.map((row) => {
          const nis = String(row.NIS || "").trim();
          const nisn = String(row.NISN || "").trim();
          const fullName = String(row.NAMA_LENGKAP || "").trim();
          const majorCode = String(row.KODE_JURUSAN || "").trim().toUpperCase();
          const majorId = majorMap.get(majorCode);

          let isValid = true;
          let error = "";

          if (!nis || !nisn || !fullName) {
            isValid = false;
            error = "NIS, NISN, atau Nama kosong";
          } else if (!majorId) {
            isValid = false;
            error = `Kode jurusan '${majorCode}' tidak ditemukan`;
          }

          return {
            nis,
            nisn,
            fullName,
            birthPlace: String(row.TEMPAT_LAHIR || "").trim(),
            birthDate: String(row.TANGGAL_LAHIR || "").trim(),
            gender: String(row.JENIS_KELAMIN || "L").toUpperCase() === "P" ? "P" : "L",
            majorCode,
            majorId,
            address: String(row.ALAMAT || "").trim(),
            validUntil: String(row.MASA_BERLAKU || "Juli 2027").trim(),
            isValid,
            error,
          };
        });

        setParsedData(rows);
      } catch (err: any) {
        alert("Gagal membaca file Excel: " + err.message);
      }
    };
    reader.readAsBinaryString(file);
  };

  // Process Excel Import to Database
  const handleProcessImport = async () => {
    const validRows = parsedData.filter((r) => r.isValid && r.majorId);
    if (validRows.length === 0) {
      alert("Tidak ada baris data valid untuk diimpor!");
      return;
    }

    setIsImporting(true);
    try {
      const payload = validRows.map((r) => ({
        nis: r.nis,
        nisn: r.nisn,
        fullName: r.fullName,
        birthPlace: r.birthPlace,
        birthDate: r.birthDate,
        gender: r.gender,
        address: r.address,
        majorId: r.majorId!,
        validUntil: r.validUntil,
      }));

      const res = await bulkImportStudents(payload);
      setImportResult(res);
      if (res.success) {
        router.refresh();
      }
    } catch (err: any) {
      setImportResult({ success: false, errors: [err.message] });
    } finally {
      setIsImporting(false);
    }
  };

  // Process Bulk Photos Upload
  const handleBulkPhotos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;

    setPhotoFiles(files);
    setUploadProgress({ total: files.length, completed: 0, success: 0 });

    let completed = 0;
    let success = 0;

    for (const file of files) {
      try {
        // Filename without extension (e.g. "2425001" or "0078912345")
        const identifier = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;

        const formData = new FormData();
        formData.append("file", file);
        formData.append("identifier", identifier);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const json = await res.json();
        if (json.success && json.url) {
          // Update student photo with matching NIS
          const updateRes = await fetch("/api/upload/match", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              identifier: identifier,
              photoUrl: json.url,
            }),
          });
          if (updateRes.ok) success++;
        }
      } catch (err) {
        console.error("Bulk photo upload error:", err);
      } finally {
        completed++;
        setUploadProgress({ total: files.length, completed, success });
      }
    }

    router.refresh();
  };

  return (
    <div className="p-8 max-w-5xl mx-auto w-full space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/siswa"
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Impor Data Siswa & Foto Massal
            </h1>
            <p className="text-xs text-slate-500">
              Unggah data dalam jumlah banyak via Excel atau sinkronkan koleksi foto siswa
            </p>
          </div>
        </div>

        <button
          onClick={handleDownloadTemplate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md shadow-emerald-600/25 transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Unduh Template Excel</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab("excel")}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-all ${
            activeTab === "excel"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>1. Impor Berkas Excel (.xlsx)</span>
        </button>
        <button
          onClick={() => setActiveTab("photos")}
          className={`pb-3 border-b-2 flex items-center gap-2 transition-all ${
            activeTab === "photos"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Images className="w-4 h-4" />
          <span>2. Unggah Foto Massal (Berdasarkan NIS)</span>
        </button>
      </div>

      {/* TAB 1: EXCEL */}
      {activeTab === "excel" && (
        <div className="space-y-6">
          {/* Upload Zone */}
          <div className="p-8 border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl bg-white text-center transition-all">
            <input
              type="file"
              id="excelInput"
              accept=".xlsx, .xls, .csv"
              onChange={handleExcelUpload}
              className="hidden"
            />
            <label
              htmlFor="excelInput"
              className="cursor-pointer flex flex-col items-center justify-center space-y-3"
            >
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
                <FileSpreadsheet className="w-7 h-7" />
              </div>
              <div>
                <span className="font-bold text-slate-800 text-sm block">
                  {fileName ? fileName : "Klik untuk memilih file Excel (.xlsx / .csv)"}
                </span>
                <span className="text-xs text-slate-400 mt-1 block">
                  Pastikan kolom sesuai dengan contoh template yang disediakan
                </span>
              </div>
            </label>
          </div>

          {/* Import Result Notification */}
          {importResult && (
            <div
              className={`p-4 rounded-xl text-xs flex items-center justify-between border ${
                importResult.success
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-red-50 border-red-200 text-red-800"
              }`}
            >
              <div className="flex items-center gap-2">
                {importResult.success ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                )}
                <span>
                  {importResult.success
                    ? `Berhasil mengimpor/memperbarui ${importResult.count} data siswa!`
                    : "Gagal mengimpor data. Periksa pesan kesalahan berikut."}
                </span>
              </div>
              {importResult.success && (
                <Link
                  href="/siswa"
                  className="font-bold underline text-emerald-900 ml-4 hover:opacity-80"
                >
                  Buka Halaman Siswa →
                </Link>
              )}
            </div>
          )}

          {/* Parsed Preview Table */}
          {parsedData.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Pratinjau Data ({parsedData.length} Baris Terdeteksi)
                  </h3>
                  <p className="text-xs text-slate-500">
                    {parsedData.filter((r) => r.isValid).length} baris valid,{" "}
                    {parsedData.filter((r) => !r.isValid).length} baris bermasalah
                  </p>
                </div>

                <button
                  onClick={handleProcessImport}
                  disabled={isImporting || parsedData.filter((r) => r.isValid).length === 0}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition-all disabled:opacity-50"
                >
                  {isImporting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  <span>
                    {isImporting
                      ? "Sedang Mengimpor..."
                      : `Proses Impor ${parsedData.filter((r) => r.isValid).length} Siswa`}
                  </span>
                </button>
              </div>

              <div className="overflow-x-auto max-h-96 border border-slate-100 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 sticky top-0 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">NIS</th>
                      <th className="py-2.5 px-3">NISN</th>
                      <th className="py-2.5 px-3">Nama Lengkap</th>
                      <th className="py-2.5 px-3">Jurusan</th>
                      <th className="py-2.5 px-3">TTL</th>
                      <th className="py-2.5 px-3">Alamat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedData.map((row, idx) => (
                      <tr
                        key={idx}
                        className={row.isValid ? "hover:bg-slate-50" : "bg-red-50/50"}
                      >
                        <td className="py-2.5 px-3">
                          {row.isValid ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Siap
                            </span>
                          ) : (
                            <span
                              className="inline-flex items-center gap-1 text-[11px] text-red-600 font-bold"
                              title={row.error}
                            >
                              <AlertCircle className="w-3.5 h-3.5" /> Error
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-medium">{row.nis}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-500">{row.nisn}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">{row.fullName}</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold text-[10px]">
                            {row.majorCode}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          {row.birthPlace}, {row.birthDate}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 truncate max-w-[150px]">
                          {row.address}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: BULK PHOTOS */}
      {activeTab === "photos" && (
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm">
              <Info className="w-4 h-4 text-blue-700" />
              <span>Panduan Penamaan Berkas Foto Massal</span>
            </div>
            <p className="leading-relaxed">
              Agar sistem dapat mencocokkan foto dengan siswa secara otomatis, beri nama berkas foto sesuai <strong>NIS</strong> atau <strong>NISN</strong> siswa.
            </p>
            <div className="bg-white/80 p-3 rounded-xl border border-blue-100 font-mono text-[11px] space-y-1">
              <div>Contoh: <code>2425001.jpg</code> → otomatis terhubung ke siswa dengan NIS 2425001</div>
              <div>Contoh: <code>0078912345.png</code> → otomatis terhubung ke siswa dengan NISN 0078912345</div>
            </div>
          </div>

          {/* Multiple File Picker */}
          <div className="p-8 border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl bg-white text-center transition-all">
            <input
              type="file"
              id="bulkPhotoInput"
              multiple
              accept="image/jpeg, image/png, image/webp"
              onChange={handleBulkPhotos}
              className="hidden"
            />
            <label
              htmlFor="bulkPhotoInput"
              className="cursor-pointer flex flex-col items-center justify-center space-y-3"
            >
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner">
                <Images className="w-7 h-7" />
              </div>
              <div>
                <span className="font-bold text-slate-800 text-sm block">
                  Pilih Sekaligus Banyak File Foto Siswa
                </span>
                <span className="text-xs text-slate-400 mt-1 block">
                  Pilih beberapa file sekaligus (Ctrl + Klik atau Block Semua Foto)
                </span>
              </div>
            </label>
          </div>

          {/* Progress Bar */}
          {uploadProgress && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                <span>
                  Mengunggah Foto ({uploadProgress.completed} / {uploadProgress.total})
                </span>
                <span className="text-emerald-600">
                  {uploadProgress.success} foto berhasil dicocokkan
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full transition-all duration-300"
                  style={{
                    width: `${Math.round(
                      (uploadProgress.completed / uploadProgress.total) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

