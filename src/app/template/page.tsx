import { db } from "@/lib/db";
import TemplateClient from "./TemplateClient";

export const metadata = {
  title: "Desainer Template & Tema - Generator Kartu Pelajar",
};

export default async function TemplatePage() {
  const [majors, school, sampleStudents] = await Promise.all([
    db.major.findMany({
      orderBy: { code: "asc" },
    }),
    db.schoolProfile.findFirst(),
    db.student.findMany({
      take: 10,
      orderBy: { nis: "asc" },
    }),
  ]);

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
    <TemplateClient
      majors={majors}
      school={defaultSchool}
      sampleStudents={sampleStudents}
    />
  );
}

