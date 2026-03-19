import { auth } from "@/auth";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Return a mock download URL for the uploaded file
  // In production, integrate with uploadthing or AWS S3
  const formData = await (req as any).formData?.();
  return NextResponse.json({ message: "Use the profile PATCH endpoint with a cvUrl from your file host" });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Simulate CV upload - in production, use uploadthing or AWS S3
  // For now, save to local public/uploads directory is not possible via API in Next.js
  // We return a placeholder URL
  const mockCvUrl = `/uploads/cv_${session.user.id}_${Date.now()}.pdf`;

  return NextResponse.json({
    success: true,
    cvUrl: mockCvUrl,
    message: "CV reference stored. Connect to uploadthing or S3 for real storage.",
  });
}
