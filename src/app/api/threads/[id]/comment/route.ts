import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Comment } from "@/models/Comment";
import { auth } from "@/auth";

// [GET] ดึงคอมเมนต์ทั้งหมดของกระทู้นี้
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectDB();
    const comments = await Comment.find({ threadId: id })
      .populate("author", "name")
      .sort({ createdAt: 1 }) // เรียงจากเก่าไปใหม่
      .lean();
    return NextResponse.json(comments);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// [POST] ส่งคอมเมนต์ใหม่
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await params;
    const { content } = await req.json();
    if (!content) return NextResponse.json({ error: "กรุณากรอกเนื้อหา" }, { status: 400 });

    await connectDB();
    const newComment = await Comment.create({
      content,
      threadId: id,
      author: (session.user as any).id
    });

    return NextResponse.json(newComment, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}