import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Category } from "@/models/Category";

export async function GET() {
  await connectDB();
  const categories = await Category.find().sort({ createdAt: -1 });
  return NextResponse.json(categories);
}

// แอบแถม API สร้างหมวดหมู่เผื่อไว้เลย
export async function POST(req: Request) {
  const { name } = await req.json();
  await connectDB();
  const category = await Category.create({ name });
  return NextResponse.json(category);
}