import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Category } from "@/models/Category";
import { auth } from "@/auth";

export async function GET() {
  try {
    await connectDB();
    const categories = await Category.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(categories);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name } = (await req.json()) as any;
    if (!name) return NextResponse.json({ error: "กรุณากรอกชื่อหมวดหมู่" }, { status: 400 });

    await connectDB();
    const newCategory = await Category.create({ name });
    return NextResponse.json(newCategory, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}