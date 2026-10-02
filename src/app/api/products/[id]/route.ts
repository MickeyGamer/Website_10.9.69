import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import { auth } from "@/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

interface ProductUpdateBody {
  name?: unknown;
  description?: unknown;
  price?: unknown;
  stock?: unknown;
  category?: unknown;
  images?: unknown;
  isActive?: unknown;
}

interface SessionUser {
  role?: string;
}

export async function GET(
  _req: Request,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    await connectDB();

    const product = await Product.findById(id).lean();

    if (!product) {
      return NextResponse.json(
        { error: "ไม่พบสินค้า" },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "เกิดข้อผิดพลาดในการโหลดสินค้า";

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
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

    const body = (await req.json()) as ProductUpdateBody;

    await connectDB();

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        ...body,
        price: Number(body.price),
        stock: Number(body.stock),
      },
      {
        new: true,
      }
    );

    if (!updatedProduct) {
      return NextResponse.json(
        { error: "ไม่พบสินค้าที่ต้องการแก้ไข" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedProduct);
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "เกิดข้อผิดพลาดในการแก้ไขสินค้า";

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
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

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return NextResponse.json(
        { error: "ไม่พบสินค้าที่ต้องการลบ" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "ลบสินค้าสำเร็จ",
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "เกิดข้อผิดพลาดในการลบสินค้า";

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}