import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Thread } from "@/models/Thread";
import "@/models/User"; // โหลด User มาเผื่อ populate

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectDB();
    
    // ดึงข้อมูลกระทู้ พร้อมอัปเดตยอดวิว (ใช้ returnDocument ตามกฎใหม่)
    const thread = await Thread.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { returnDocument: "after" }
    ).populate("author", "name").lean();

    if (!thread) return NextResponse.json({ error: "ไม่พบกระทู้" }, { status: 404 });
    return NextResponse.json(thread);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}