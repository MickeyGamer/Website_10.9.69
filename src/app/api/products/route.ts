import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { auth } from "@/auth";
import slugify from "slugify";

export async function GET() {
  try {
    await connectDB();
    const products = await Product.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(products);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // ใส่ : any ตรงนี้
    const body: any = await req.json();
    const { name, description, price, stock, images, isActive } = body;

    if (!name || price === undefined) {
      return NextResponse.json({ error: "กรุณากรอกชื่อและราคาสินค้า" }, { status: 400 });
    }

    await connectDB();

    const baseSlug = slugify(name, { lower: true, strict: true }) || "product";
    const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

    const newProduct = await Product.create({
      name,
      slug,
      description,
      price: Number(price),
      stock: Number(stock) || 0,
      images: images || [],
      isActive: isActive ?? true,
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}