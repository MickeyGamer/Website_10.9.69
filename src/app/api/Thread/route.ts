import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Thread } from "@/models/Thread";

export async function GET() {
  try {
    await connectDB();
    // ดึงกระทู้ เรียงจากใหม่ไปเก่า และดึงชื่อคนตั้งกระทู้มาด้วย
    const threads = await Thread.find()
      .populate("author", "name")
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json(threads);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}