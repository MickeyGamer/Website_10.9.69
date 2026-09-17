import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { auth } from "@/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    await connectDB();
    const product = await Product.findById(id).lean();

    if (!product) {
      return NextResponse.json({ error: "ไม่พบสินค้า" }, { status: 404 });
    }

    return NextResponse.json(product);
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
    const body = await req.json();

    await connectDB();
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        ...body,
        price: Number(body.price),
        stock: Number(body.stock),
      },
      { new: true }
    );

    if (!updatedProduct) {
      return NextResponse.json({ error: "ไม่พบสินค้าที่ต้องการแก้ไข" }, { status: 404 });
    }

    return NextResponse.json(updatedProduct);
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
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return NextResponse.json({ error: "ไม่พบสินค้าที่ต้องการลบ" }, { status: 404 });
    }

    return NextResponse.json({ message: "ลบสินค้าสำเร็จ" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}