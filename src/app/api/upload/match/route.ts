import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { identifier, photoUrl } = await req.json();

    if (!identifier || !photoUrl) {
      return NextResponse.json(
        { error: "Identifier dan photoUrl diperlukan" },
        { status: 400 }
      );
    }

    // Try finding by NIS or NISN
    const student = await db.student.findFirst({
      where: {
        OR: [{ nis: identifier.trim() }, { nisn: identifier.trim() }],
      },
    });

    if (!student) {
      return NextResponse.json(
        { error: `Siswa dengan NIS/NISN '${identifier}' tidak ditemukan` },
        { status: 404 }
      );
    }

    const updated = await db.student.update({
      where: { id: student.id },
      data: { photoUrl },
    });

    return NextResponse.json({ success: true, student: updated });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Gagal mencocokkan foto siswa" },
      { status: 500 }
    );
  }
}

