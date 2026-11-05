import { db } from "@/lib/db";
import SchoolSettingsClient from "./SchoolSettingsClient";

export const metadata = {
  title: "Profil Sekolah & Pengaturan - Generator Kartu Pelajar",
};

export default async function PengaturanPage() {
  const school = await db.schoolProfile.findFirst();

  const initialProfile = school || {
    schoolName: "SMK NEGERI 1 LABUHAN MARINGGAI",
    npsn: "10806050",
    address:
      "Jl. Raya Maringgai No. 1, Desa Maringgai, Kec. Labuhan Maringgai, Kab. Lampung Timur",
    phone: "(0725) 7654321",
    website: "smkn1labuhanmaringgai.sch.id",
    principalName: "Drs. H. Ahmad Dahlan, M.Pd.",
    principalNip: "19750817 200003 1 004",
    academicYear: "2026/2027",
    cityIssued: "Labuhan Maringgai",
    logoLeftUrl: null,
    logoRightUrl: null,
    signatureUrl: null,
    stampUrl: null,
  };

  return <SchoolSettingsClient initialProfile={initialProfile} />;
}

