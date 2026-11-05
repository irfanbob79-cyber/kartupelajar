"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  Search,
  Filter,
  Plus,
  FileSpreadsheet,
  Printer,
  Edit2,
  Trash2,
  CheckCircle2,
  Camera,
  MoreVertical,
  Check,
  IdCard,
} from "lucide-react";
import StudentModal from "@/components/StudentModal";
import { deleteStudent, togglePrintStatus } from "@/app/actions/student";

interface Major {
  id: string;
  code: string;
  name: string;
  themeColor: string;
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
  majorId: string;
  validUntil: string;
  isPrinted: boolean;
  major: Major;
}

interface StudentListClientProps {
  initialStudents: Student[];
  majors: Major[];
}

export default function StudentListClient({
  initialStudents,
  majors,
}: StudentListClientProps) {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [search, setSearch] = useState("");
  const [selectedMajor, setSelectedMajor] = useState("ALL");
  const [photoFilter, setPhotoFilter] = useState("ALL");
  const [printFilter, setPrintFilter] = useState("ALL");

  // Selection states
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Sync state if initialStudents changes
  useMemo(() => {
    setStudents(initialStudents);
  }, [initialStudents]);

  // Filtering
  const filteredStudents = useMemo(() => {
    return students.filter((st) => {
      // Search
      const q = search.toLowerCase();
      const matchSearch =
        !search ||
        st.fullName.toLowerCase().includes(q) ||
        st.nis.toLowerCase().includes(q) ||
        st.nisn.toLowerCase().includes(q) ||
        st.address.toLowerCase().includes(q);

      // Major
      const matchMajor = selectedMajor === "ALL" || st.majorId === selectedMajor;

      // Photo
      const matchPhoto =
        photoFilter === "ALL" ||
        (photoFilter === "HAS_PHOTO" && Boolean(st.photoUrl)) ||
        (photoFilter === "NO_PHOTO" && !st.photoUrl);

      // Print status
      const matchPrint =
        printFilter === "ALL" ||
        (printFilter === "PRINTED" && st.isPrinted) ||
        (printFilter === "NOT_PRINTED" && !st.isPrinted);

      return matchSearch && matchMajor && matchPhoto && matchPrint;
    });
  }, [students, search, selectedMajor, photoFilter, printFilter]);

  // Handle select all
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredStudents.map((s) => s.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Handle Delete
  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Apakah Anda yakin ingin menghapus data siswa ${name}?`)) {
      const res = await deleteStudent(id);
      if (res.success) {
        setStudents((prev) => prev.filter((s) => s.id !== id));
        setSelectedIds((prev) => prev.filter((itemId) => itemId !== id));
        router.refresh();
      } else {
        alert("Gagal menghapus: " + res.error);
      }
    }
  };

  // Handle Toggle Print
  const handleTogglePrint = async (st: Student) => {
    const nextStatus = !st.isPrinted;
    const res = await togglePrintStatus(st.id, nextStatus);
    if (res.success) {
      setStudents((prev) =>
        prev.map((s) => (s.id === st.id ? { ...s, isPrinted: nextStatus } : s))
      );
      router.refresh();
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-7 h-7 text-blue-600" />
            <span>Manajemen Data Siswa</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Total {students.length} siswa terdaftar di pangkalan data
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/siswa/import"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors shadow-2xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Import Excel / CSV</span>
          </Link>
          <button
            onClick={() => {
              setEditingStudent(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-md shadow-blue-500/25"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Siswa</span>
          </button>
        </div>
      </div>

      {/* Floating Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="p-3.5 rounded-xl bg-slate-900 text-white shadow-xl flex items-center justify-between gap-4 animate-fade-in border border-slate-800">
          <div className="flex items-center gap-2 text-xs font-medium pl-2">
            <span className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center font-bold text-[11px]">
              {selectedIds.length}
            </span>
            <span>siswa terpilih dari daftar</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedIds([])}
              className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white text-xs font-medium"
            >
              Batal Pilih
            </button>
            <Link
              href={`/cetak?ids=${selectedIds.join(",")}`}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs transition-colors shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak {selectedIds.length} Kartu Terpilih</span>
            </Link>
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari Nama, NIS, NISN, Alamat..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Jurusan */}
          <select
            value={selectedMajor}
            onChange={(e) => setSelectedMajor(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Semua Jurusan</option>
            {majors.map((m) => (
              <option key={m.id} value={m.id}>
                {m.code} - {m.name}
              </option>
            ))}
          </select>

          {/* Photo Status */}
          <select
            value={photoFilter}
            onChange={(e) => setPhotoFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Status Foto (Semua)</option>
            <option value="HAS_PHOTO">Ada Foto</option>
            <option value="NO_PHOTO">Belum Ada Foto</option>
          </select>

          {/* Print Status */}
          <select
            value={printFilter}
            onChange={(e) => setPrintFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">Status Cetak (Semua)</option>
            <option value="PRINTED">Sudah Dicetak</option>
            <option value="NOT_PRINTED">Belum Dicetak</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={
                      filteredStudents.length > 0 &&
                      selectedIds.length === filteredStudents.length
                    }
                    onChange={handleSelectAll}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-3 w-16">Foto</th>
                <th className="py-3 px-3">NIS / NISN</th>
                <th className="py-3 px-3">Nama Lengkap & JK</th>
                <th className="py-3 px-3">Jurusan</th>
                <th className="py-3 px-3">TTL & Alamat</th>
                <th className="py-3 px-3 text-center">Status Cetak</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Users className="w-10 h-10 mx-auto text-slate-300 mb-2 stroke-1" />
                    <p className="font-medium text-sm text-slate-600">
                      Tidak ada data siswa ditemukan
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Coba sesuaikan kata kunci pencarian atau filter yang dipilih.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st) => {
                  const isChecked = selectedIds.includes(st.id);
                  return (
                    <tr
                      key={st.id}
                      className={`hover:bg-blue-50/40 transition-colors ${
                        isChecked ? "bg-blue-50/50" : ""
                      }`}
                    >
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleSelectOne(st.id)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>

                      {/* Photo Thumbnail */}
                      <td className="py-3 px-3">
                        <div className="w-10 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                          {st.photoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={st.photoUrl}
                              alt={st.fullName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Camera className="w-4 h-4 text-slate-400 stroke-1" />
                          )}
                        </div>
                      </td>

                      {/* NIS / NISN */}
                      <td className="py-3 px-3">
                        <span className="font-mono font-bold text-slate-900 block">
                          {st.nis}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">
                          {st.nisn}
                        </span>
                      </td>

                      {/* Full Name & Gender */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 text-xs">
                          {st.fullName}
                        </div>
                        <span className="text-[10px] text-slate-500 inline-flex items-center gap-1">
                          Gender: {st.gender === "L" ? "Laki-laki" : "Perempuan"}
                        </span>
                      </td>

                      {/* Major */}
                      <td className="py-3 px-3">
                        <span
                          className="px-2.5 py-1 rounded-full text-[10px] font-bold text-white inline-block shadow-2xs"
                          style={{ backgroundColor: st.major.themeColor }}
                        >
                          {st.major.code}
                        </span>
                        <span className="block text-[10px] text-slate-500 mt-0.5 truncate max-w-[130px]">
                          {st.major.name}
                        </span>
                      </td>

                      {/* Birth & Address */}
                      <td className="py-3 px-3">
                        <div className="text-slate-700">
                          {st.birthPlace}, {st.birthDate}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[180px]">
                          {st.address}
                        </div>
                      </td>

                      {/* Print Status */}
                      <td className="py-3 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleTogglePrint(st)}
                          title="Klik untuk ubah status cetak"
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                            st.isPrinted
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                              : "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200"
                          }`}
                        >
                          {st.isPrinted ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Sudah</span>
                            </>
                          ) : (
                            <span>Belum</span>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/cetak?ids=${st.id}`}
                            title="Preview & Cetak Kartu"
                            className="p-1.5 rounded-lg border border-slate-200 text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingStudent(st);
                              setIsModalOpen(true);
                            }}
                            title="Edit Data Siswa"
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(st.id, st.fullName)}
                            title="Hapus Siswa"
                            className="p-1.5 rounded-lg border border-slate-200 text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Modal */}
      <StudentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        majors={majors}
        initialData={editingStudent}
        onSuccess={() => {
          router.refresh();
        }}
      />
    </div>
  );
}

