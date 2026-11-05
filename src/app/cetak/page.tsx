import { db } from "@/lib/db";
import PrintClient from "./PrintClient";

export const metadata = {
  title: "Studio Cetak - Generator Kartu Pelajar",
};

interface CetakPageProps {
  searchParams: Promise<{
    ids?: string;
    nis?: string;
  }>;
}

export default async function CetakPage({ searchParams }: CetakPageProps) {
  const resolvedParams = await searchParams;
  const idsParam = resolvedParams?.ids;
  const nisParam = resolvedParams?.nis;

  const [students, school] = await Promise.all([
    db.student.findMany({
      include: { major: true },
      orderBy: { nis: "asc" },
    }),
    db.schoolProfile.findFirst(),
  ]);

  let initialSelectedIds: string[] = [];
  if (idsParam) {
    initialSelectedIds = idsParam.split(",").filter(Boolean);
  } else if (nisParam) {
    const matched = students.find((s) => s.nis === nisParam);
    if (matched) initialSelectedIds = [matched.id];
  }

  const defaultSchool = school || {
    schoolName: "SMK NEGERI 1 LABUHAN MARINGGAI",
    npsn: "10806050",
    address: "Jl. Raya Maringgai No. 1, Labuhan Maringgai, Lampung Timur",
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

  return (
    <PrintClient
      students={students}
      school={defaultSchool}
      initialSelectedIds={initialSelectedIds}
    />
  );
}

