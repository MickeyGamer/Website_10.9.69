import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Post } from "@/models/Post";
import { auth } from "@/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

interface SessionUser {
  role?: string;
}

type PostStatus = "DRAFT" | "PUBLISHED";

interface UpdatePostData {
  title?: string;
  content?: string;
  excerpt?: string;
  coverImage?: string;
  category?: string;
  status?: PostStatus;
}

export async function GET(
  _req: Request,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    await connectDB();

    const post = await Post.findById(id).lean();

    if (!post) {
      return NextResponse.json(
        { error: "ไม่พบบทความ" },
        { status: 404 }
      );
    }

    return NextResponse.json(post);
  } catch (error: unknown) {
    console.error("GET /api/posts/[id] error:", error);

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

export async function PUT(
  req: Request,
  { params }: RouteParams
) {
  const session = await auth();

  const user = session?.user as SessionUser | undefined;

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;

    const data = (await req.json()) as UpdatePostData;

    await connectDB();

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      {
        ...data,
        ...(data.title !== undefined && {
          title: data.title.trim(),
        }),
        ...(data.status !== undefined && {
          status: data.status,
        }),
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedPost) {
      return NextResponse.json(
        { error: "ไม่พบบทความที่ต้องการแก้ไข" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedPost);
  } catch (error: unknown) {
    console.error("PUT /api/posts/[id] error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "เกิดข้อผิดพลาดในการแก้ไขบทความ";

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: RouteParams
) {
  const session = await auth();

  const user = session?.user as SessionUser | undefined;

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;

    await connectDB();

    const deletedPost = await Post.findByIdAndDelete(id);

    if (!deletedPost) {
      return NextResponse.json(
        { error: "ไม่พบบทความที่ต้องการลบ" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "ลบบทความสำเร็จ",
    });
  } catch (error: unknown) {
    console.error("DELETE /api/posts/[id] error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "เกิดข้อผิดพลาดในการลบบทความ";

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}