"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";

export async function updateMajorTheme(
  id: string,
  themeColor: string,
  accentColor: string,
  backgroundFrontUrl?: string | null,
  backgroundBackUrl?: string | null,
  showPhotoBorder?: boolean,
  photoStyle?: string,
  footerStyle?: string,
  footerLeftMode?: string,
  footerLogoUrl?: string | null
) {
  try {
    const updated = await db.major.update({
      where: { id },
      data: {
        themeColor,
        accentColor,
        ...(backgroundFrontUrl !== undefined && { backgroundFrontUrl }),
        ...(backgroundBackUrl !== undefined && { backgroundBackUrl }),
        ...(showPhotoBorder !== undefined && { showPhotoBorder }),
        ...(photoStyle !== undefined && { photoStyle }),
        ...(footerStyle !== undefined && { footerStyle }),
        ...(footerLeftMode !== undefined && { footerLeftMode }),
        ...(footerLogoUrl !== undefined && { footerLogoUrl }),
      },
    });

    revalidatePath("/template");
    revalidatePath("/cetak");
    revalidatePath("/siswa");
    revalidatePath("/");

    return { success: true, major: updated };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function applyBackgroundToAllMajors(
  backgroundFrontUrl?: string | null,
  backgroundBackUrl?: string | null,
  showPhotoBorder?: boolean,
  photoStyle?: string,
  footerStyle?: string,
  footerLeftMode?: string,
  footerLogoUrl?: string | null
) {
  try {
    await db.major.updateMany({
      data: {
        ...(backgroundFrontUrl !== undefined && { backgroundFrontUrl }),
        ...(backgroundBackUrl !== undefined && { backgroundBackUrl }),
        ...(showPhotoBorder !== undefined && { showPhotoBorder }),
        ...(photoStyle !== undefined && { photoStyle }),
        ...(footerStyle !== undefined && { footerStyle }),
        ...(footerLeftMode !== undefined && { footerLeftMode }),
        ...(footerLogoUrl !== undefined && { footerLogoUrl }),
      },
    });

    revalidatePath("/template");
    revalidatePath("/cetak");
    revalidatePath("/siswa");
    revalidatePath("/");

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createMajor(data: {
  code: string;
  name: string;
  themeColor?: string;
  accentColor?: string;
}) {
  try {
    const code = data.code.trim().toUpperCase();
    const name = data.name.trim();

    if (!code || !name) {
      return { success: false, error: "Kode dan Nama Jurusan wajib diisi" };
    }

    const existing = await db.major.findUnique({ where: { code } });
    if (existing) {
      return { success: false, error: `Jurusan dengan kode ${code} sudah ada` };
    }

    const major = await db.major.create({
      data: {
        code,
        name,
        themeColor: data.themeColor || "#1E3A8A",
        accentColor: data.accentColor || "#F59E0B",
        photoStyle: "SEAMLESS",
        footerStyle: "CLEAN",
        footerLeftMode: "TEXT",
        footerLogoUrl: "/images/smk-bisa-hebat.jpg",
      },
    });

    revalidatePath("/template");
    revalidatePath("/siswa");
    revalidatePath("/cetak");
    revalidatePath("/");
    revalidatePath("/isi-data");

    return { success: true, major };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateMajorInfo(
  id: string,
  data: {
    code: string;
    name: string;
    themeColor?: string;
    accentColor?: string;
  }
) {
  try {
    const code = data.code.trim().toUpperCase();
    const name = data.name.trim();

    if (!code || !name) {
      return { success: false, error: "Kode dan Nama Jurusan wajib diisi" };
    }

    const existing = await db.major.findFirst({
      where: { code, NOT: { id } },
    });
    if (existing) {
      return { success: false, error: `Kode jurusan ${code} sudah digunakan oleh jurusan lain` };
    }

    const updated = await db.major.update({
      where: { id },
      data: {
        code,
        name,
        ...(data.themeColor && { themeColor: data.themeColor }),
        ...(data.accentColor && { accentColor: data.accentColor }),
      },
    });

    revalidatePath("/template");
    revalidatePath("/siswa");
    revalidatePath("/cetak");
    revalidatePath("/");
    revalidatePath("/isi-data");

    return { success: true, major: updated };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteMajor(id: string) {
  try {
    const studentCount = await db.student.count({ where: { majorId: id } });
    if (studentCount > 0) {
      return {
        success: false,
        error: `Tidak dapat menghapus jurusan ini karena masih ada ${studentCount} siswa terdaftar di dalamnya. Pindahkan atau hapus siswa terlebih dahulu.`,
      };
    }

    await db.major.delete({ where: { id } });

    revalidatePath("/template");
    revalidatePath("/siswa");
    revalidatePath("/cetak");
    revalidatePath("/");
    revalidatePath("/isi-data");

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
