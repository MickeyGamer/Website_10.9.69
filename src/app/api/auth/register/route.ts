import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    // =========================================================
    // 1. ตรวจสอบข้อมูลเบื้องต้น
    // =========================================================

    if (!name || !email || !password) {
      return NextResponse.json(
        {
          error: "กรุณากรอกข้อมูลให้ครบถ้วน",
        },
        { status: 400 }
      );
    }

    // =========================================================
    // 2. ตรวจสอบชื่อ
    // =========================================================

    if (name.length < 2) {
      return NextResponse.json(
        {
          error: "ชื่อนามแฝงต้องมีอย่างน้อย 2 ตัวอักษร",
        },
        { status: 400 }
      );
    }

    if (name.length > 50) {
      return NextResponse.json(
        {
          error: "ชื่อนามแฝงต้องไม่เกิน 50 ตัวอักษร",
        },
        { status: 400 }
      );
    }

    // ป้องกันชื่อที่เป็นช่องว่างหรืออักขระแปลก ๆ ทั้งหมด
    if (!/[a-zA-Zก-๙0-9]/.test(name)) {
      return NextResponse.json(
        {
          error: "ชื่อนามแฝงต้องมีตัวอักษรหรือตัวเลข",
        },
        { status: 400 }
      );
    }

    // =========================================================
    // 3. ตรวจสอบ Email
    // =========================================================

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          error: "กรุณากรอกอีเมลให้ถูกต้อง",
        },
        { status: 400 }
      );
    }

    if (email.length > 100) {
      return NextResponse.json(
        {
          error: "อีเมลต้องไม่เกิน 100 ตัวอักษร",
        },
        { status: 400 }
      );
    }

    // =========================================================
    // 4. ตรวจสอบ Password
    // =========================================================

    if (password.length < 6) {
      return NextResponse.json(
        {
          error: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร",
        },
        { status: 400 }
      );
    }

    if (password.length > 100) {
      return NextResponse.json(
        {
          error: "รหัสผ่านต้องไม่เกิน 100 ตัวอักษร",
        },
        { status: 400 }
      );
    }

    // ต้องมีตัวอักษรอย่างน้อย 1 ตัว
    if (!/[a-zA-Z]/.test(password)) {
      return NextResponse.json(
        {
          error: "รหัสผ่านต้องมีตัวอักษรอย่างน้อย 1 ตัว",
        },
        { status: 400 }
      );
    }

    // ต้องมีตัวเลขอย่างน้อย 1 ตัว
    if (!/[0-9]/.test(password)) {
      return NextResponse.json(
        {
          error: "รหัสผ่านต้องมีตัวเลขอย่างน้อย 1 ตัว",
        },
        { status: 400 }
      );
    }

    // =========================================================
    // 5. เชื่อมต่อ MongoDB
    // =========================================================

    await connectDB();

    // =========================================================
    // 6. ตรวจสอบ Email / Name ซ้ำ
    // =========================================================

    const existing = await User.findOne({
      $or: [{ email }, { name }],
    });

    if (existing) {
      if (existing.email === email) {
        return NextResponse.json(
          {
            error: "อีเมลนี้ถูกใช้งานแล้ว",
          },
          { status: 400 }
        );
      }

      if (existing.name === name) {
        return NextResponse.json(
          {
            error: "ชื่อนามแฝงนี้มีคนใช้แล้ว กรุณาตั้งชื่ออื่นครับ",
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          error: "ข้อมูลนี้ถูกใช้งานแล้ว",
        },
        { status: 400 }
      );
    }

    // =========================================================
    // 7. Hash Password
    // =========================================================

    const hashedPassword = await bcrypt.hash(password, 10);

    // =========================================================
    // 8. สร้าง User
    // =========================================================

    let user;

    try {
      user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: "USER",
      });
    } catch (err: unknown) {
      const mongoErr = err as {
        code?: number;
        keyPattern?: Record<string, unknown>;
      };

      // MongoDB Duplicate Key
      if (mongoErr.code === 11000) {
        const field = mongoErr.keyPattern
          ? Object.keys(mongoErr.keyPattern)[0]
          : "email";

        return NextResponse.json(
          {
            error:
              field === "email"
                ? "อีเมลนี้ถูกใช้งานแล้ว"
                : field === "name"
                ? "ชื่อนามแฝงนี้มีคนใช้แล้ว กรุณาตั้งชื่ออื่นครับ"
                : "ข้อมูลนี้ถูกใช้งานแล้ว",
          },
          { status: 400 }
        );
      }

      throw err;
    }

    // =========================================================
    // 9. ส่งข้อมูลกลับ
    // =========================================================

    return NextResponse.json(
      {
        success: true,
        message: "สมัครสมาชิกสำเร็จ",

        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("Register error:", error);

    // JSON ไม่ถูกต้อง
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          error: "ข้อมูลที่ส่งมาไม่ถูกต้อง",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "เกิดข้อผิดพลาดในการสมัครสมาชิก กรุณาลองใหม่อีกครั้ง",
      },
      {
        status: 500,
      }
    );
  }
}