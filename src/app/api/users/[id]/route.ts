import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { auth } from "@/auth";
import mongoose from "mongoose";

interface RouteParams {
  params: Promise<{ id: string }>;
}

interface UpdateUserBody {
  name?: unknown;
  email?: unknown;
  role?: unknown;
}

const ALLOWED_ROLES = ["ADMIN", "AUTHOR", "USER"] as const;

type UserRole = (typeof ALLOWED_ROLES)[number];

export async function GET(
  _req: Request,
  { params }: RouteParams
) {
  const session = await auth();

  if ((session?.user as { role?: string })?.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "รหัสผู้ใช้ไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findById(id)
      .select("-password")
      .lean();

    if (!user) {
      return NextResponse.json(
        { error: "ไม่พบผู้ใช้" },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error: unknown) {
    console.error("GET /api/users/[id] error:", error);

    return NextResponse.json(
      { error: "ไม่สามารถโหลดข้อมูลผู้ใช้ได้" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: RouteParams
) {
  const session = await auth();

  if ((session?.user as { role?: string })?.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "รหัสผู้ใช้ไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    const body = (await req.json()) as UpdateUserBody;
    const { name, email, role } = body;

    // ================================
    // Validate name
    // ================================
    if (name !== undefined) {
      if (
        typeof name !== "string" ||
        name.trim().length < 2 ||
        name.trim().length > 100
      ) {
        return NextResponse.json(
          { error: "ชื่อต้องมีความยาว 2-100 ตัวอักษร" },
          { status: 400 }
        );
      }
    }

    // ================================
    // Validate email
    // ================================
    if (email !== undefined) {
      if (
        typeof email !== "string" ||
        email.trim().length === 0 ||
        email.trim().length > 255
      ) {
        return NextResponse.json(
          { error: "อีเมลไม่ถูกต้อง" },
          { status: 400 }
        );
      }
    }

    // ================================
    // Validate role
    // ================================
    if (
      role !== undefined &&
      (typeof role !== "string" ||
        !ALLOWED_ROLES.includes(role as UserRole))
    ) {
      return NextResponse.json(
        { error: "Role ไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    await connectDB();

    const updateData: {
      name?: string;
      email?: string;
      role?: UserRole;
    } = {};

    if (typeof name === "string") {
      updateData.name = name.trim();
    }

    if (typeof email === "string") {
      updateData.email = email.trim().toLowerCase();
    }

    if (
      typeof role === "string" &&
      ALLOWED_ROLES.includes(role as UserRole)
    ) {
      updateData.role = role as UserRole;
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    )
      .select("-password")
      .lean();

    if (!updatedUser) {
      return NextResponse.json(
        { error: "ไม่พบผู้ใช้" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedUser);
  } catch (error: unknown) {
    console.error(
      "PUT /api/users/[id] error:",
      error
    );

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: unknown }).code === 11000
    ) {
      return NextResponse.json(
        { error: "อีเมลนี้ถูกใช้งานแล้ว" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "ไม่สามารถแก้ไขข้อมูลผู้ใช้ได้" },
      { status: 500 }
    );
  }
}