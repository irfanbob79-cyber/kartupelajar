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
