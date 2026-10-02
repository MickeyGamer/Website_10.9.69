import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";

export async function POST(req: Request) {
  try {
    // =========================
    // รับข้อมูล
    // =========================

    const body = await req.json();

    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    // =========================
    // ตรวจสอบข้อมูล
    // =========================

    if (!name || !email || !password) {
      return NextResponse.json(
        {
          error: "กรุณากรอกข้อมูลให้ครบ",
        },
        {
          status: 400,
        }
      );
    }

    if (name.length < 2) {
      return NextResponse.json(
        {
          error: "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร",
        },
        {
          status: 400,
        }
      );
    }

    if (name.length > 100) {
      return NextResponse.json(
        {
          error: "ชื่อยาวเกินไป",
        },
        {
          status: 400,
        }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        {
          error: "รูปแบบอีเมลไม่ถูกต้อง",
        },
        {
          status: 400,
        }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        {
          error: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร",
        },
        {
          status: 400,
        }
      );
    }

    if (password.length > 100) {
      return NextResponse.json(
        {
          error: "รหัสผ่านยาวเกินไป",
        },
        {
          status: 400,
        }
      );
    }

    // =========================
    // Connect MongoDB
    // =========================

    await connectDB();

    // =========================
    // ตรวจสอบ Email ซ้ำ
    // =========================

    const existingUser = await User.findOne({
      email,
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error: "อีเมลนี้มีในระบบแล้ว",
        },
        {
          status: 400,
        }
      );
    }

    // =========================
    // Hash Password
    // =========================

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    // =========================
    // สร้าง User
    // =========================

    const user = await User.create({
      name,
      email,
      password: hashedPassword,

      // สมาชิกใหม่เป็น USER เสมอ
      role: "USER",
    });

    // =========================
    // Response
    // =========================

    return NextResponse.json(
      {
        message: "สมัครสมาชิกสำเร็จ!",
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
    console.error(
      "Register API Error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "เกิดข้อผิดพลาดในการสมัครสมาชิก",
      },
      {
        status: 500,
      }
    );
  }
}