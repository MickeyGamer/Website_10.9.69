import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Comment } from "@/models/Comment";
import { Thread } from "@/models/Thread";
import { auth } from "@/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(
  req: Request,
  { params }: RouteParams
) {
  // ตรวจสอบ Login
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      {
        error: "กรุณาเข้าสู่ระบบก่อนแสดงความคิดเห็น",
      },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;

    // ตรวจสอบ Thread ID
    if (!id) {
      return NextResponse.json(
        {
          error: "ไม่พบรหัสกระทู้",
        },
        { status: 400 }
      );
    }

    // อ่านข้อมูลจาก Request
    const body = await req.json();

    const content =
      typeof body?.content === "string"
        ? body.content.trim()
        : "";

    // ตรวจสอบเนื้อหา
    if (!content || content === "<p></p>") {
      return NextResponse.json(
        {
          error: "กรุณาพิมพ์เนื้อหาคอมเมนต์",
        },
        { status: 400 }
      );
    }

    // จำกัดความยาว Comment
    if (content.length > 5000) {
      return NextResponse.json(
        {
          error: "ความคิดเห็นต้องไม่เกิน 5,000 ตัวอักษร",
        },
        { status: 400 }
      );
    }

    // ตรวจสอบ User ID จาก Session
    const userId = (session.user as { id?: string }).id;

    if (!userId) {
      return NextResponse.json(
        {
          error: "ไม่พบข้อมูลผู้ใช้งานใน Session",
        },
        { status: 401 }
      );
    }

    await connectDB();

    // ตรวจสอบว่ากระทู้มีอยู่จริง
    const thread = await Thread.findById(id);

    if (!thread) {
      return NextResponse.json(
        {
          error: "ไม่พบกระทู้ที่ต้องการแสดงความคิดเห็น",
        },
        { status: 404 }
      );
    }

    // สร้าง Comment
    const newComment = await Comment.create({
      thread: thread._id,
      author: userId,
      content,
    });

    // เพิ่มจำนวนความคิดเห็น
    await Thread.findByIdAndUpdate(id, {
      $inc: { repliesCount: 1 },
    });

    return NextResponse.json(newComment, {
      status: 201,
    });
  } catch (error) {
    console.error(
      "POST /api/threads/[id]/comments error:",
      error
    );

    return NextResponse.json(
      {
        error: "ไม่สามารถเพิ่มความคิดเห็นได้",
      },
      { status: 500 }
    );
  }
}