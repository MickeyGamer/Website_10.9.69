import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Category } from "@/models/Category";
import { auth } from "@/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

interface SessionUser {
  role?: string;
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

    const deletedCategory = await Category.findByIdAndDelete(id);

    if (!deletedCategory) {
      return NextResponse.json(
        { error: "ไม่พบหมวดหมู่ที่ต้องการลบ" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "ลบหมวดหมู่สำเร็จ",
    });
  } catch (error: unknown) {
    console.error(
      "DELETE /api/categories/[id] error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "เกิดข้อผิดพลาดในการลบหมวดหมู่";

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}