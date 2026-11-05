"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

export type SchoolProfileData = {
  schoolName: string;
  npsn: string;
  address: string;
  phone: string;
  website: string;
  principalName: string;
  principalNip: string;
  academicYear: string;
  cityIssued: string;
  logoLeftUrl?: string | null;
  logoRightUrl?: string | null;
  signatureUrl?: string | null;
  stampUrl?: string | null;
};

export async function updateSchoolProfile(data: SchoolProfileData) {
  try {
    const existing = await db.schoolProfile.findFirst();

    let school;
    if (existing) {
      school = await db.schoolProfile.update({
        where: { id: existing.id },
        data,
      });
    } else {
      school = await db.schoolProfile.create({
        data,
      });
    }

    revalidatePath("/pengaturan");
    revalidatePath("/template");
    revalidatePath("/cetak");
    revalidatePath("/");

    return { success: true, school };
  } catch (error: any) {
    console.error("Error updating school profile:", error);
    return { success: false, error: error.message || "Gagal menyimpan data sekolah" };
  }
}

