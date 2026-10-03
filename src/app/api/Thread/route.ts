import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Thread } from "@/models/Thread";
import { auth } from "@/auth";

export async function GET() {
  try {
    await connectDB();
    const threads = await Thread.find()
      .populate("author", "name")
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json(threads);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "กรุณาเข้าสู่ระบบก่อนตั้งกระทู้" }, { status: 401 });
  }

  try {
    // 1. เพิ่มการรับค่า room จากหน้าฟอร์มฝั่ง Client
    const { title, content, room } = (await req.json()) as any;
    
    // 2. เช็กว่ากรอกครบไหม (ป้องกันข้อมูลแหว่ง)
    if (!title || !content || !room) {
      return NextResponse.json({ error: "กรุณากรอกหัวข้อ เนื้อหา และเลือกห้องให้ครบถ้วน" }, { status: 400 });
    }

    await connectDB();
    
    // 3. บันทึก room ลงฐานข้อมูลพร้อมกับข้อมูลอื่นๆ
    const newThread = await Thread.create({
      title,
      content,
      room, // เพิ่มฟิลด์นี้เข้าไป
      author: (session.user as any).id,
    });

    return NextResponse.json(newThread, { status: 201 });
  } catch (error: any) {
    console.error("🔥 Error ตอนตั้งกระทู้:", error); // ให้มันแสดงใน Terminal เผื่อพังอีก
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการตั้งกระทู้: " + error.message }, { status: 500 });
  }
}