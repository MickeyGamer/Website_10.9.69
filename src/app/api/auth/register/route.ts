import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();
    await connectDB();

    // เช็กว่ามีอีเมลนี้ในระบบหรือยัง
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "อีเมลนี้มีในระบบแล้ว" }, { status: 400 });
    }

    // สร้าง User ใหม่ (คนแรกที่สมัคร ให้สิทธิ์เป็น ADMIN อัตโนมัติ)
    const isFirstUser = (await User.countDocuments()) === 0;
    const role = isFirstUser ? "ADMIN" : "USER";

    const user = await User.create({ name, email, password, role });

    return NextResponse.json({ message: "สมัครสมาชิกสำเร็จ!", user }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการสมัครสมาชิก" }, { status: 500 });
  }
}