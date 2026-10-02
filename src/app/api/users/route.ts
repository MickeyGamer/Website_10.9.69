import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { auth } from "@/auth";

export async function GET() {
  const session = await auth();

  if ((session?.user as { role?: string })?.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    await connectDB();

    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(users);
  } catch (error) {
    console.error("GET /api/users error:", error);

    return NextResponse.json(
      { error: "ไม่สามารถโหลดข้อมูลผู้ใช้ได้" },
      { status: 500 }
    );
  }
}