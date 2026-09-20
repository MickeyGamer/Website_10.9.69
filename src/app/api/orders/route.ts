import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { auth } from "@/auth";

// [เพิ่มใหม่] สำหรับ Admin ดึงรายการคำสั่งซื้อทั้งหมดไปดูหลังบ้าน
export async function GET() {
  const session = await auth();
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    // ดึงข้อมูลคำสั่งซื้อ พร้อมดึงชื่อผู้ใช้และชื่อสินค้ามาแสดงด้วย
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("items.product", "name")
      .sort({ createdAt: -1 }) // เรียงจากใหม่ไปเก่า
      .lean();
    
    return NextResponse.json(orders);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// [ของเดิม] สำหรับลูกค้ากดสั่งซื้อสินค้า
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "กรุณาเข้าสู่ระบบก่อนทำการสั่งซื้อ" }, { status: 401 });
    }

    const body: any = await req.json();
    const { items, totalAmount } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "ไม่มีสินค้าในตะกร้า" }, { status: 400 });
    }

    await connectDB();

    const newOrder = await Order.create({
      user: (session.user as any).id,
      items: items.map((item: any) => ({
        product: item._id,
        quantity: item.quantity,
        price: item.price,
      })),
      totalAmount,
      status: "PENDING",
    });

    return NextResponse.json({ orderId: newOrder._id }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}