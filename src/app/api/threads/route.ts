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
    // เติม as any ตรงนี้
    const { title, content } = (await req.json()) as any;
    
    if (!title || !content) {
      return NextResponse.json({ error: "กรุณากรอกหัวข้อและเนื้อหา" }, { status: 400 });
    }

    await connectDB();
    const newThread = await Thread.create({
      title,
      content,
      author: (session.user as any).id,
    });

    return NextResponse.json(newThread, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}