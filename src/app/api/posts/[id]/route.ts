import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Post } from "@/models/Post";

// [GET] ดึงข้อมูล 1 บทความ
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectDB();
    const post = await Post.findById(id);
    if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(post);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// [PUT] อัปเดตข้อมูล
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    await connectDB();
    const updatedPost = await Post.findByIdAndUpdate(id, body, { returnDocument: "after" });
    return NextResponse.json(updatedPost, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// [DELETE] ลบข้อมูล
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectDB();
    const deletedPost = await Post.findByIdAndDelete(id);
    if (!deletedPost) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ message: "Deleted successfully" }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}