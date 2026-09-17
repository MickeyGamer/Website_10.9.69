import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { name, email, password } = (await req.json()) as any;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "กรุณากรอกข้อมูลให้ครบถ้วน" }, { status: 400 });
    }

    await connectDB();

    // 1. เช็คว่ามีอีเมลนี้ในระบบหรือยัง
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "อีเมลนี้ถูกใช้งานแล้ว" }, { status: 400 });
    }

    // 2. เข้ารหัสผ่าน (Hashing) เพื่อความปลอดภัยขั้นสุด
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. บันทึกลง MongoDB
    await User.create({
      name,
      email,
      password: hashedPassword,
      role: "USER", // ค่าเริ่มต้นเป็นผู้ใช้ทั่วไป
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}