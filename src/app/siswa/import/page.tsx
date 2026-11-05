import { db } from "@/lib/db";
import ImportClient from "./ImportClient";

export const metadata = {
  title: "Import Siswa & Foto - Generator Kartu Pelajar",
};

export default async function ImportPage() {
  const majors = await db.major.findMany({
    orderBy: { code: "asc" },
  });

  return <ImportClient majors={majors} />;
}

