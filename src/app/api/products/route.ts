import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { auth } from "@/auth";
import slugify from "slugify";

// GET /api/products
export async function GET() {
  try {
    await connectDB();

    const products = await Product.find({
      isActive: true,
    })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(products);
  } catch (error) {
    console.error("GET /api/products error:", error);

    return NextResponse.json(
      { error: "ไม่สามารถโหลดสินค้าได้" },
      { status: 500 }
    );
  }
}

// POST /api/products
export async function POST(req: Request) {
  try {
    // ตรวจสอบสิทธิ์ Admin
    const session = await auth();

    if (
      !session?.user ||
      (session.user as { role?: string }).role !== "ADMIN"
    ) {
      return NextResponse.json(
        { error: "ไม่มีสิทธิ์ดำเนินการ" },
        { status: 401 }
      );
    }

    const body = await req.json();

    const {
      name,
      description,
      price,
      stock,
      images,
      category,
      isActive,
    } = body;

    // ตรวจสอบข้อมูลจำเป็น
    if (!name || String(name).trim() === "") {
      return NextResponse.json(
        { error: "กรุณาระบุชื่อสินค้า" },
        { status: 400 }
      );
    }

    if (price === undefined || price === null || Number(price) < 0) {
      return NextResponse.json(
        { error: "กรุณาระบุราคาสินค้าให้ถูกต้อง" },
        { status: 400 }
      );
    }

    if (stock !== undefined && Number(stock) < 0) {
      return NextResponse.json(
        { error: "จำนวนสินค้าต้องไม่ติดลบ" },
        { status: 400 }
      );
    }

    await connectDB();

    // สร้าง slug จากชื่อสินค้า
    const baseSlug =
      slugify(String(name), {
        lower: true,
        strict: true,
        locale: "th",
      }) || "product";

    const slug = `${baseSlug}-${Date.now().toString().slice(-6)}`;

    const newProduct = await Product.create({
      name: String(name).trim(),
      slug,
      description: description ? String(description).trim() : "",
      price: Number(price),
      stock: stock !== undefined ? Number(stock) : 0,
      images: Array.isArray(images) ? images : [],
      category: category ? String(category).trim() : "",
      isActive: isActive ?? true,
    });

    return NextResponse.json(newProduct, {
      status: 201,
    });
  } catch (error: unknown) {
    console.error("POST /api/products error:", error);

    // Duplicate slug
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: number }).code === 11000
    ) {
      return NextResponse.json(
        { error: "Slug ของสินค้านี้มีอยู่แล้ว" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "ไม่สามารถสร้างสินค้าได้" },
      { status: 500 }
    );
  }
}