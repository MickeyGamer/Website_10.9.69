import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import { Post } from "@/models/Post";

interface SessionUser {
  id?: string;
}

type PostStatus = "DRAFT" | "PUBLISHED";

interface PostData {
  title?: string;
  content?: string;
  excerpt?: string;
  coverImage?: string;
  category?: string;
  status?: PostStatus;
}

export async function GET() {
  try {
    await connectDB();

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(posts);
  } catch (error: unknown) {
    console.error("GET /api/posts error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "เกิดข้อผิดพลาดในการโหลดบทความ";

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const data = (await req.json()) as PostData;

    const user = session.user as SessionUser;

    if (!user.id) {
      return NextResponse.json(
        { error: "ไม่พบ ID ของผู้เขียน" },
        { status: 401 }
      );
    }

    if (!data.title?.trim()) {
      return NextResponse.json(
        { error: "กรุณากรอกชื่อบทความ" },
        { status: 400 }
      );
    }

    if (!data.content?.trim()){
      return NextResponse.json(
        { error: "กรุณากรอกเนื้อหาบทความ" },
        { status: 400 }
      );
    }

    await connectDB();

    const newPost = await Post.create({
      title: data.title.trim(),
      content: data.content,
      excerpt: data.excerpt ?? "",
      coverImage: data.coverImage ?? "",
      category: data.category ?? "",
      status: data.status ?? "DRAFT",
      author: user.id,
    });

    return NextResponse.json(newPost, { status: 201 });
  } catch (error: unknown) {
    console.error("POST /api/posts error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "เกิดข้อผิดพลาดในการสร้างบทความ";

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}