"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

export async function checkStudentByIdentifier(identifier: string) {
  try {
    const clean = identifier.trim();
    if (!clean) return { found: false, error: "NIS atau NISN tidak boleh kosong" };

    const student = await db.student.findFirst({
      where: {
        OR: [{ nis: clean }, { nisn: clean }],
      },
      include: {
        major: true,
      },
    });

    if (student) {
      return { found: true, student };
    }

    return { found: false, message: "Data siswa belum terdaftar. Anda dapat melengkapi biodata baru." };
  } catch (err: any) {
    return { found: false, error: err.message };
  }
}

export async function submitStudentSelfData(data: {
  nis: string;
  nisn: string;
  fullName: string;
  birthPlace: string;
  birthDate: string;
  gender: string;
  address: string;
  majorId: string;
  photoUrl?: string | null;
}) {
  try {
    const nis = data.nis.trim();
    const nisn = data.nisn.trim();
    const fullName = data.fullName.trim().toUpperCase();

    if (!nis || !nisn || !fullName) {
      return { success: false, error: "NIS, NISN, dan Nama Lengkap wajib diisi" };
    }

    // Upsert student based on NIS
    const student = await db.student.upsert({
      where: { nis },
      update: {
        nisn,
        fullName,
        birthPlace: data.birthPlace.trim(),
        birthDate: data.birthDate.trim(),
        gender: data.gender,
        address: data.address.trim(),
        majorId: data.majorId,
        ...(data.photoUrl && { photoUrl: data.photoUrl }),
      },
      create: {
        nis,
        nisn,
        fullName,
        birthPlace: data.birthPlace.trim(),
        birthDate: data.birthDate.trim(),
        gender: data.gender,
        address: data.address.trim(),
        majorId: data.majorId,
        photoUrl: data.photoUrl || null,
        status: "AKTIF",
        validUntil: "Juli 2027",
      },
    });

    revalidatePath("/siswa");
    revalidatePath("/");
    revalidatePath("/cetak");

    return { success: true, student };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal menyimpan biodata" };
  }
}

