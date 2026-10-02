import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Category } from "@/models/Category";
import { auth } from "@/auth";

interface SessionUser {
  role?: string;
}

interface CategoryData {
  name?: unknown;
}

export async function GET() {
  try {
    await connectDB();

    const categories = await Category.find()
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(categories);
  } catch (error: unknown) {
    console.error("GET /api/categories error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "เกิดข้อผิดพลาดในการโหลดหมวดหมู่";

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const session = await auth();

  const user = session?.user as SessionUser | undefined;

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const data = (await req.json()) as CategoryData;

    if (
      typeof data.name !== "string" ||
      !data.name.trim()
    ) {
      return NextResponse.json(
        { error: "กรุณากรอกชื่อหมวดหมู่" },
        { status: 400 }
      );
    }

    await connectDB();

    const newCategory = await Category.create({
      name: data.name.trim(),
    });

    return NextResponse.json(
      newCategory,
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("POST /api/categories error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "เกิดข้อผิดพลาดในการสร้างหมวดหมู่";

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}