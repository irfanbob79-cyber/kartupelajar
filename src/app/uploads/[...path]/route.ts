import { NextRequest, NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import path from "path";

// MIME type map for standard web image formats
const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".pdf": "application/pdf",
};

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: urlSegments } = await context.params;

    if (!urlSegments || urlSegments.length === 0) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // Security check: prevent directory traversal attacks
    const baseDir = path.resolve(process.cwd(), "public", "uploads");
    const requestedPath = path.resolve(baseDir, ...urlSegments);

    if (!requestedPath.startsWith(baseDir)) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    // Check if file exists
    try {
      const fileStat = await stat(requestedPath);
      if (!fileStat.isFile()) {
        return new NextResponse("Not Found", { status: 404 });
      }
    } catch {
      return new NextResponse("File Not Found", { status: 404 });
    }

    // Read file buffer
    const fileBuffer = await readFile(requestedPath);
    const ext = path.extname(requestedPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch (error: any) {
    console.error("Error serving uploaded asset:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
