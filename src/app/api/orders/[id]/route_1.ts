import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { auth } from "@/auth";
import mongoose from "mongoose";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const ALLOWED_STATUS = [
  "PENDING",
  "PAID",
  "SHIPPED",
  "COMPLETED",
  "CANCELLED",
] as const;

type OrderStatus = (typeof ALLOWED_STATUS)[number];

// ==================================================
// GET /api/orders/[id]
// USER / AUTHOR → ดู Order ของตัวเอง
// ADMIN         → ดู Order ได้ทั้งหมด
// ==================================================

export async function GET(
  _req: Request,
  { params }: RouteParams
) {
  try {
    // -------------------------------------------------
    // Session
    // -------------------------------------------------

    const session = await auth();

    const user = session?.user as
      | {
          id?: string;
          role?: string;
        }
      | undefined;

    if (!user?.id) {
      return NextResponse.json(
        { error: "กรุณาเข้าสู่ระบบ" },
        { status: 401 }
      );
    }

    // -------------------------------------------------
    // ตรวจสอบ Order ID
    // -------------------------------------------------

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "รหัสคำสั่งซื้อไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    // -------------------------------------------------
    // Database
    // -------------------------------------------------

    await connectDB();

    // ADMIN ดูได้ทุก Order
    // USER / AUTHOR ดูได้เฉพาะ Order ของตัวเอง

    const filter =
      user.role === "ADMIN"
        ? { _id: id }
        : {
            _id: id,
            user: user.id,
          };

    const order = await Order.findOne(filter)
      .populate("user", "name email")
      .populate("items.product", "name")
      .lean();

    if (!order) {
      return NextResponse.json(
        { error: "ไม่พบคำสั่งซื้อ" },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("GET /api/orders/[id] error:", error);

    return NextResponse.json(
      { error: "ไม่สามารถโหลดรายละเอียดคำสั่งซื้อได้" },
      { status: 500 }
    );
  }
}

// ==================================================
// PUT /api/orders/[id]
// ADMIN → เปลี่ยนสถานะ Order
// ==================================================

export async function PUT(
  req: Request,
  { params }: RouteParams
) {
  try {
    // -------------------------------------------------
    // Session + Role
    // -------------------------------------------------

    const session = await auth();

    const user = session?.user as
      | {
          id?: string;
          role?: string;
        }
      | undefined;

    if (!user?.id) {
      return NextResponse.json(
        { error: "กรุณาเข้าสู่ระบบ" },
        { status: 401 }
      );
    }

    if (user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "คุณไม่มีสิทธิ์แก้ไขคำสั่งซื้อ" },
        { status: 403 }
      );
    }

    // -------------------------------------------------
    // ตรวจสอบ Order ID
    // -------------------------------------------------

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "รหัสคำสั่งซื้อไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    // -------------------------------------------------
    // อ่าน Request Body
    // -------------------------------------------------

    let body: Record<string, unknown>;

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "ข้อมูลที่ส่งมาไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    if (
      !body ||
      typeof body !== "object" ||
      Array.isArray(body)
    ) {
      return NextResponse.json(
        { error: "รูปแบบข้อมูลไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    const status =
      typeof body.status === "string"
        ? body.status.trim()
        : undefined;

    // -------------------------------------------------
    // ตรวจสอบ Status
    // -------------------------------------------------

    if (!status) {
      return NextResponse.json(
        { error: "กรุณาระบุสถานะคำสั่งซื้อ" },
        { status: 400 }
      );
    }

    if (
      !ALLOWED_STATUS.includes(
        status as OrderStatus
      )
    ) {
      return NextResponse.json(
        { error: "สถานะคำสั่งซื้อไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    // -------------------------------------------------
    // Database
    // -------------------------------------------------

    await connectDB();

    // -------------------------------------------------
    // Update Order
    // -------------------------------------------------

    const updatedOrder =
      await Order.findByIdAndUpdate(
        id,
        {
          status,
        },
        {
          new: true,
          runValidators: true,
        }
      )
        .populate("user", "name email")
        .populate("items.product", "name")
        .lean();

    // -------------------------------------------------
    // ตรวจสอบ Order
    // -------------------------------------------------

    if (!updatedOrder) {
      return NextResponse.json(
        { error: "ไม่พบคำสั่งซื้อ" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "อัปเดตสถานะคำสั่งซื้อสำเร็จ",
      order: updatedOrder,
    });
  } catch (error) {
    console.error(
      "PUT /api/orders/[id] error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "ไม่สามารถอัปเดตสถานะคำสั่งซื้อได้",
      },
      { status: 500 }
    );
  }
}