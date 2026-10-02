import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/models/Order";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

const ALLOWED_STATUS = [
  "PENDING",
  "PAID",
  "SHIPPED",
  "COMPLETED",
  "CANCELLED",
] as const;

type OrderStatus = (typeof ALLOWED_STATUS)[number];

/**
 * GET /api/orders/[id]
 * ดูรายละเอียด Order
 */
export async function GET(
  _request: Request,
  { params }: RouteParams
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "กรุณาเข้าสู่ระบบ" },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Order ID ไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    await connectDB();

    const isAdmin = session.user.role === "ADMIN";

    const order = isAdmin
      ? await Order.findById(id)
          .populate("user", "name email")
          .populate("items.product", "name")
          .lean()
      : await Order.findOne({
          _id: id,
          user: session.user.id,
        })
          .populate("user", "name email")
          .populate("items.product", "name")
          .lean();

    if (!order) {
      return NextResponse.json(
        { error: "ไม่พบคำสั่งซื้อ" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        order,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/orders/[id] error:", error);

    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการดึงข้อมูลคำสั่งซื้อ" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/orders/[id]
 * Admin ใช้เปลี่ยนสถานะ Order
 */
export async function PUT(
  request: Request,
  { params }: RouteParams
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "กรุณาเข้าสู่ระบบ" },
        { status: 401 }
      );
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "ไม่มีสิทธิ์แก้ไขคำสั่งซื้อ" },
        { status: 403 }
      );
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Order ID ไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "รูปแบบ JSON ไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    if (
      typeof body !== "object" ||
      body === null ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        { error: "ข้อมูลไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    const { status } = body as {
      status?: unknown;
    };

    if (typeof status !== "string") {
      return NextResponse.json(
        { error: "กรุณาระบุสถานะ Order" },
        { status: 400 }
      );
    }

    if (!ALLOWED_STATUS.includes(status as OrderStatus)) {
      return NextResponse.json(
        {
          error: "สถานะ Order ไม่ถูกต้อง",
          allowedStatus: ALLOWED_STATUS,
        },
        { status: 400 }
      );
    }

    await connectDB();

    const order = await Order.findByIdAndUpdate(
      id,
      {
        $set: {
          status: status as OrderStatus,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    )
      .populate("user", "name email")
      .populate("items.product", "name")
      .lean();

    if (!order) {
      return NextResponse.json(
        { error: "ไม่พบคำสั่งซื้อ" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "อัปเดตสถานะคำสั่งซื้อสำเร็จ",
        order,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("PUT /api/orders/[id] error:", error);

    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการอัปเดตคำสั่งซื้อ" },
      { status: 500 }
    );
  }
}