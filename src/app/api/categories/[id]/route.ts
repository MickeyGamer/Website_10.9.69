import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Category } from "@/models/Category";
import { auth } from "@/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function DELETE(req: Request, { params }: RouteParams) {
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    await connectDB();
    await Category.findByIdAndDelete(id);
    return NextResponse.json({ message: "ลบหมวดหมู่สำเร็จ" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}