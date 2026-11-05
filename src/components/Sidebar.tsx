"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileSpreadsheet,
  Palette,
  Printer,
  School,
  IdCard,
  UserCheck,
  Copy,
  ExternalLink,
} from "lucide-react";
import { useState } from "react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Data Siswa", href: "/siswa", icon: Users },
  { name: "Import Excel", href: "/siswa/import", icon: FileSpreadsheet },
  { name: "Template & Desain", href: "/template", icon: Palette },
  { name: "Studio Cetak", href: "/cetak", icon: Printer },
  { name: "Profil Sekolah", href: "/pengaturan", icon: School },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [copied, setCopied] = useState(false);

  // Jangan tampilkan sidebar jika siswa membuka portal publik /isi-data
  if (pathname?.startsWith("/isi-data")) {
    return null;
  }

  const handleCopyLink = () => {
    const url = `${window.location.origin}/isi-data`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <aside className="w-64 bg-slate-900 text-slate-200 flex flex-col shrink-0 min-h-screen border-r border-slate-800">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
          <IdCard className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-bold text-white text-base leading-tight tracking-tight">
            KartuPelajar<span className="text-blue-400">PRO</span>
          </h1>
          <p className="text-xs text-slate-400">ID Card Generator</p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          Menu Utama Admin
        </div>
        {navigation.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-600/40"
                  : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-slate-400"}`} />
              <span>{item.name}</span>
            </Link>
          );
        })}

        {/* Portal Siswa Share Box */}
        <div className="pt-4 px-2">
          <div className="p-3 rounded-xl bg-gradient-to-b from-blue-950/60 to-slate-800/80 border border-blue-800/40 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-blue-200">
              <span className="flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>Portal Siswa Mandiri</span>
              </span>
              <span className="text-[9px] px-1.5 py-0.2 bg-blue-500/30 text-blue-300 rounded font-bold">
                Publik
              </span>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              Kirimkan link ini ke WhatsApp siswa agar siswa dapat mengisi foto & biodata sendiri tanpa akses admin.
            </p>
            <div className="flex gap-1.5 pt-1">
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex-1 py-1.5 px-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold flex items-center justify-center gap-1 transition-colors"
              >
                <Copy className="w-3 h-3" />
                <span>{copied ? "Tersalin!" : "Salin Link"}</span>
              </button>
              <Link
                href="/isi-data"
                target="_blank"
                className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
                title="Buka Portal Siswa di Tab Baru"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* School Footer Badge */}
      <div className="p-4 m-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs">
        <div className="flex items-center gap-2 text-slate-300 font-semibold mb-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>SMKN 1 Labuhan Maringgai</span>
        </div>
        <p className="text-slate-400 text-[11px]">T.A 2026/2027 • Standar RFID CR80</p>
      </div>
    </aside>
  );
}
