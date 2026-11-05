"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

export type StudentFormData = {
  nis: string;
  nisn: string;
  fullName: string;
  birthPlace: string;
  birthDate: string;
  gender: string;
  address: string;
  majorId: string;
  validUntil: string;
  photoUrl?: string | null;
};

export async function createStudent(data: StudentFormData) {
  try {
    const student = await db.student.create({
      data: {
        nis: data.nis.trim(),
        nisn: data.nisn.trim(),
        fullName: data.fullName.trim().toUpperCase(),
        birthPlace: data.birthPlace.trim(),
        birthDate: data.birthDate.trim(),
        gender: data.gender,
        address: data.address.trim(),
        majorId: data.majorId,
        validUntil: data.validUntil || "Juli 2027",
        photoUrl: data.photoUrl || null,
        status: "AKTIF",
      },
    });

    revalidatePath("/siswa");
    revalidatePath("/");
    return { success: true, student };
  } catch (error: any) {
    console.error("Error creating student:", error);
    if (error.code === "P2002") {
      return {
        success: false,
        error: "NIS atau NISN sudah terdaftar di sistem. Gunakan nomor unik.",
      };
    }
    return { success: false, error: error.message || "Gagal menyimpan data siswa." };
  }
}

export async function updateStudent(id: string, data: Partial<StudentFormData>) {
  try {
    const student = await db.student.update({
      where: { id },
      data: {
        ...(data.nis && { nis: data.nis.trim() }),
        ...(data.nisn && { nisn: data.nisn.trim() }),
        ...(data.fullName && { fullName: data.fullName.trim().toUpperCase() }),
        ...(data.birthPlace && { birthPlace: data.birthPlace.trim() }),
        ...(data.birthDate && { birthDate: data.birthDate.trim() }),
        ...(data.gender && { gender: data.gender }),
        ...(data.address && { address: data.address.trim() }),
        ...(data.majorId && { majorId: data.majorId }),
        ...(data.validUntil && { validUntil: data.validUntil }),
        ...(data.photoUrl !== undefined && { photoUrl: data.photoUrl }),
      },
    });

    revalidatePath("/siswa");
    revalidatePath("/");
    return { success: true, student };
  } catch (error: any) {
    console.error("Error updating student:", error);
    if (error.code === "P2002") {
      return {
        success: false,
        error: "NIS atau NISN sudah terdaftar pada siswa lain.",
      };
    }
    return { success: false, error: error.message || "Gagal memperbarui data siswa." };
  }
}

export async function deleteStudent(id: string) {
  try {
    await db.student.delete({
      where: { id },
    });

    revalidatePath("/siswa");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting student:", error);
    return { success: false, error: error.message || "Gagal menghapus data siswa." };
  }
}

export async function togglePrintStatus(id: string, isPrinted: boolean) {
  try {
    const student = await db.student.update({
      where: { id },
      data: { isPrinted },
    });

    revalidatePath("/siswa");
    revalidatePath("/");
    return { success: true, student };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function bulkImportStudents(studentsList: StudentFormData[]) {
  try {
    let count = 0;
    const errors: string[] = [];

    for (const item of studentsList) {
      try {
        await db.student.upsert({
          where: { nis: item.nis.trim() },
          update: {
            nisn: item.nisn.trim(),
            fullName: item.fullName.trim().toUpperCase(),
            birthPlace: item.birthPlace.trim(),
            birthDate: item.birthDate.trim(),
            gender: item.gender || "L",
            address: item.address.trim(),
            majorId: item.majorId,
            validUntil: item.validUntil || "Juli 2027",
            ...(item.photoUrl && { photoUrl: item.photoUrl }),
          },
          create: {
            nis: item.nis.trim(),
            nisn: item.nisn.trim(),
            fullName: item.fullName.trim().toUpperCase(),
            birthPlace: item.birthPlace.trim(),
            birthDate: item.birthDate.trim(),
            gender: item.gender || "L",
            address: item.address.trim(),
            majorId: item.majorId,
            validUntil: item.validUntil || "Juli 2027",
            photoUrl: item.photoUrl || null,
          },
        });
        count++;
      } catch (err: any) {
        errors.push(`NIS ${item.nis} (${item.fullName}): ${err.message}`);
      }
    }

    revalidatePath("/siswa");
    revalidatePath("/");
    return { success: true, count, errors };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
