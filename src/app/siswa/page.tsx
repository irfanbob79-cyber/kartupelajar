import { db } from "@/lib/db";
import StudentListClient from "./StudentListClient";

export const metadata = {
  title: "Data Siswa - Generator Kartu Pelajar",
};

export default async function SiswaPage() {
  const [students, majors] = await Promise.all([
    db.student.findMany({
      include: { major: true },
      orderBy: { nis: "asc" },
    }),
    db.major.findMany({
      orderBy: { code: "asc" },
    }),
  ]);

  return <StudentListClient initialStudents={students} majors={majors} />;
}

