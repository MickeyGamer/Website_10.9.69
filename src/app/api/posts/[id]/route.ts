import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Post } from "@/models/Post";
import { auth } from "@/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    await connectDB();
    const post = await Post.findById(id).lean();
    
    if (!post) {
      return NextResponse.json({ error: "ไม่พบบทความ" }, { status: 404 });
    }
    
    return NextResponse.json(post);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const data = await req.json();
    await connectDB();
    
    const updatedPost = await Post.findByIdAndUpdate(id, data, { new: true });
    
    return NextResponse.json(updatedPost);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    await connectDB();
    
    const deletedPost = await Post.findByIdAndDelete(id);
    if (!deletedPost) {
      return NextResponse.json({ error: "ไม่พบบทความที่ต้องการลบ" }, { status: 404 });
    }

    return NextResponse.json({ message: "ลบบทความสำเร็จ" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}