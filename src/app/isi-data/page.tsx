import { db } from "@/lib/db";
import StudentSelfForm from "./StudentSelfForm";

export const metadata = {
  title: "Formulir Biodata & Pas Foto Siswa Mandiri",
  description:
    "Portal mandiri siswa untuk mengisi biodata dan mengunggah pas foto kartu pelajar tanpa login",
};

export default async function IsiDataPage() {
  const [majors, school] = await Promise.all([
    db.major.findMany({
      orderBy: { code: "asc" },
    }),
    db.schoolProfile.findFirst(),
  ]);

  const defaultSchool = school || {
    schoolName: "SMK NEGERI 1 LABUHAN MARINGGAI",
    academicYear: "2026/2027",
    logoLeftUrl: "/images/logo-sekolah.png",
  };

  return <StudentSelfForm majors={majors} school={defaultSchool} />;
}

