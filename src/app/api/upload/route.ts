import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";

    // 1. JSON Payload (Base64 captured from Webcam)
    if (contentType.includes("application/json")) {
      const { imageBase64, filename } = await req.json();
      if (!imageBase64) {
        return NextResponse.json({ error: "Data gambar tidak ditemukan" }, { status: 400 });
      }

      const matches = imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return NextResponse.json({ error: "Format base64 tidak valid" }, { status: 400 });
      }

      const buffer = Buffer.from(matches[2], "base64");
      const safeName = (filename || "capture")
        .replace(/[^a-zA-Z0-9_-]/g, "")
        .slice(0, 30);
      const generatedFilename = `${safeName}_${Date.now()}.jpg`;

      const uploadDir = path.join(process.cwd(), "public", "uploads", "students");
      const filePath = path.join(uploadDir, generatedFilename);

      await writeFile(filePath, buffer);

      return NextResponse.json({
        success: true,
        url: `/uploads/students/${generatedFilename}`,
      });
    }

    // 2. FormData (File Upload)
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const identifier = (formData.get("identifier") as string) || "student";

    if (!file) {
      return NextResponse.json({ error: "Tidak ada file yang diupload" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = path.extname(file.name) || ".jpg";
    const safeName = identifier.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 30);
    const generatedFilename = `${safeName}_${Date.now()}${ext}`;

    const uploadDir = path.join(process.cwd(), "public", "uploads", "students");
    const filePath = path.join(uploadDir, generatedFilename);

    await writeFile(filePath, buffer);

    return NextResponse.json({
      success: true,
      url: `/uploads/students/${generatedFilename}`,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal mengupload berkas" },
      { status: 500 }
    );
  }
}

