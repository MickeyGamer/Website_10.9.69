import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Comment } from "@/models/Comment";
import { Thread } from "@/models/Thread";
import { auth } from "@/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "กรุณาเข้าสู่ระบบก่อนแสดงความคิดเห็น" }, { status: 401 });
  }

  try {
    const { id } = await params;
    // เติม as any ตรงนี้
    const { content } = (await req.json()) as any;

    if (!content || content === "<p></p>") {
      return NextResponse.json({ error: "กรุณาพิมพ์เนื้อหาคอมเมนต์" }, { status: 400 });
    }

    await connectDB();
    
    const newComment = await Comment.create({
      thread: id,
      author: (session.user as any).id,
      content,
    });

    await Thread.findByIdAndUpdate(id, { $inc: { repliesCount: 1 } });

    return NextResponse.json(newComment, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}