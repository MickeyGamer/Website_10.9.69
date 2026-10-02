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
  } catch (error) {
    console.error("GET /api/threads error:", error);

    return NextResponse.json(
      {
        error: "ไม่สามารถโหลดกระทู้ได้",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  // ตรวจสอบการเข้าสู่ระบบ
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      {
        error: "กรุณาเข้าสู่ระบบก่อนตั้งกระทู้",
      },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();

    const title =
      typeof body?.title === "string"
        ? body.title.trim()
        : "";

    const content =
      typeof body?.content === "string"
        ? body.content.trim()
        : "";

    // ตรวจสอบข้อมูล
    if (!title || !content) {
      return NextResponse.json(
        {
          error: "กรุณากรอกหัวข้อและเนื้อหา",
        },
        { status: 400 }
      );
    }

    // จำกัดความยาวหัวข้อ
    if (title.length > 200) {
      return NextResponse.json(
        {
          error: "หัวข้อกระทู้ต้องไม่เกิน 200 ตัวอักษร",
        },
        { status: 400 }
      );
    }

    // จำกัดความยาวเนื้อหา
    if (content.length > 50000) {
      return NextResponse.json(
        {
          error: "เนื้อหากระทู้ยาวเกินกำหนด",
        },
        { status: 400 }
      );
    }

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

    const newThread = await Thread.create({
      title,
      content,
      author: userId,
    });

    return NextResponse.json(newThread, {
      status: 201,
    });
  } catch (error) {
    console.error("POST /api/threads error:", error);

    return NextResponse.json(
      {
        error: "ไม่สามารถสร้างกระทู้ได้",
      },
      { status: 500 }
    );
  }
}