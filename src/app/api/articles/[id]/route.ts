import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import { Article } from "@/models/Article";
import mongoose from "mongoose";
import slugify from "slugify";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const ALLOWED_STATUS = [
  "DRAFT",
  "PENDING",
  "PUBLISHED",
  "REJECTED",
] as const;

type ArticleStatus = (typeof ALLOWED_STATUS)[number];

// =====================================================
// GET /api/articles/[id]
// ดูบทความรายตัว
// =====================================================

export async function GET(
  _req: Request,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    // -------------------------------------------------
    // ตรวจสอบ ID
    // -------------------------------------------------

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "รหัสบทความไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    await connectDB();

    // -------------------------------------------------
    // Session
    // -------------------------------------------------

    const session = await auth();

    const role = (
      session?.user as { role?: string } | undefined
    )?.role;

    const userId = (
      session?.user as { id?: string } | undefined
    )?.id;

    // -------------------------------------------------
    // ดึงบทความ
    // -------------------------------------------------

    const article = await Article.findById(id)
      .populate("author", "name")
      .lean();

    if (!article) {
      return NextResponse.json(
        { error: "ไม่พบบทความ" },
        { status: 404 }
      );
    }

    // -------------------------------------------------
    // ตรวจสอบเจ้าของบทความ
    // -------------------------------------------------

    const articleAuthorId =
      typeof article.author === "object" &&
      article.author !== null &&
      "_id" in article.author
        ? String(article.author._id)
        : String(article.author);

    const isAdmin = role === "ADMIN";

    const isAuthor = role === "AUTHOR";

    const isOwner =
      isAuthor &&
      !!userId &&
      articleAuthorId === userId;

    // -------------------------------------------------
    // สิทธิ์การดู
    //
    // Guest / USER -> PUBLISHED
    // AUTHOR       -> บทความของตัวเอง
    // ADMIN        -> ทุกสถานะ
    // -------------------------------------------------

    if (
      article.status !== "PUBLISHED" &&
      !isAdmin &&
      !isOwner
    ) {
      return NextResponse.json(
        { error: "คุณไม่มีสิทธิ์ดูบทความนี้" },
        { status: 403 }
      );
    }

    return NextResponse.json(article);
  } catch (error) {
    console.error(
      "GET /api/articles/[id] error:",
      error
    );

    return NextResponse.json(
      { error: "ไม่สามารถโหลดบทความได้" },
      { status: 500 }
    );
  }
}

// =====================================================
// PUT /api/articles/[id]
// แก้ไขบทความ
// =====================================================

export async function PUT(
  req: Request,
  { params }: RouteParams
) {
  try {
    // -------------------------------------------------
    // ตรวจสอบ Session
    // -------------------------------------------------

    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "กรุณาเข้าสู่ระบบก่อนแก้ไขบทความ" },
        { status: 401 }
      );
    }

    const role = (session.user as { role?: string }).role;
    const userId = (session.user as { id?: string }).id;

    // -------------------------------------------------
    // ตรวจสอบ Role
    // -------------------------------------------------

    if (role !== "AUTHOR" && role !== "ADMIN") {
      return NextResponse.json(
        { error: "คุณไม่มีสิทธิ์แก้ไขบทความ" },
        { status: 403 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: "ไม่พบข้อมูลผู้ใช้งานใน Session" },
        { status: 401 }
      );
    }

    // -------------------------------------------------
    // ตรวจสอบ ID
    // -------------------------------------------------

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "รหัสบทความไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    // -------------------------------------------------
    // อ่าน Body
    // -------------------------------------------------

    // -------------------------------------------------
    // จำกัดขนาด Request Body
    // -------------------------------------------------

    const MAX_BODY_SIZE = 1_000_000; // 1 MB

    let rawBody: string;

    try {
      rawBody = await req.text();
    } catch {
      return NextResponse.json(
        { error: "ไม่สามารถอ่านข้อมูลที่ส่งมาได้" },
        { status: 400 }
      );
    }

    if (new TextEncoder().encode(rawBody).length > MAX_BODY_SIZE) {
      return NextResponse.json(
        { error: "ข้อมูลที่ส่งมามีขนาดใหญ่เกินไป" },
        { status: 413 }
      );
    }

    let body: Record<string, unknown>;

    try {
      body = JSON.parse(rawBody);

      if (!body || typeof body !== "object" || Array.isArray(body)) {
        return NextResponse.json(
          { error: "รูปแบบข้อมูลไม่ถูกต้อง" },
          { status: 400 }
        );
      }
    } catch {
      return NextResponse.json(
        { error: "ข้อมูลที่ส่งมาไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    // -------------------------------------------------
    // แปลงข้อมูล
    // -------------------------------------------------

    const title =
      body.title !== undefined
        ? String(body.title).trim()
        : undefined;

    const excerpt =
      body.excerpt !== undefined
        ? String(body.excerpt).trim()
        : undefined;

    const content =
      body.content !== undefined
        ? String(body.content).trim()
        : undefined;

    const coverImage =
      body.coverImage !== undefined
        ? String(body.coverImage).trim()
        : undefined;

    const category =
      body.category !== undefined
        ? String(body.category).trim()
        : undefined;

    const status =
      body.status !== undefined
        ? String(body.status)
        : undefined;

    await connectDB();

    // -------------------------------------------------
    // ค้นหาบทความ
    // -------------------------------------------------

    const article = await Article.findById(id);

    if (!article) {
      return NextResponse.json(
        { error: "ไม่พบบทความ" },
        { status: 404 }
      );
    }

    // -------------------------------------------------
    // AUTHOR แก้ได้เฉพาะบทความตัวเอง
    // ADMIN แก้ได้ทุกบทความ
    // -------------------------------------------------

    if (
      role === "AUTHOR" &&
      article.author.toString() !== userId
    ) {
      return NextResponse.json(
        { error: "คุณไม่มีสิทธิ์แก้ไขบทความนี้" },
        { status: 403 }
      );
    }

    // =================================================
    // Validation
    // =================================================

    // -------------------------------------------------
    // Title
    // -------------------------------------------------

    if (title !== undefined) {
      if (!title) {
        return NextResponse.json(
          { error: "กรุณากรอกชื่อบทความ" },
          { status: 400 }
        );
      }

      if (title.length < 3 || title.length > 200) {
        return NextResponse.json(
          {
            error:
              "ชื่อบทความต้องมีความยาว 3-200 ตัวอักษร",
          },
          { status: 400 }
        );
      }
    }

    // -------------------------------------------------
    // Excerpt
    // -------------------------------------------------

    if (excerpt !== undefined && excerpt.length > 500) {
      return NextResponse.json(
        { error: "คำโปรยต้องไม่เกิน 500 ตัวอักษร" },
        { status: 400 }
      );
    }

    // -------------------------------------------------
    // Content
    // -------------------------------------------------

    if (content !== undefined && !content) {
      return NextResponse.json(
        { error: "เนื้อหาบทความต้องไม่ว่าง" },
        { status: 400 }
      );
    }

    // -------------------------------------------------
    // Cover Image
    // -------------------------------------------------

    if (
      coverImage !== undefined &&
      coverImage.length > 2000
    ) {
      return NextResponse.json(
        {
          error:
            "URL รูปปกต้องไม่เกิน 2000 ตัวอักษร",
        },
        { status: 400 }
      );
    }

    // -------------------------------------------------
    // Category
    // -------------------------------------------------

    if (
      category !== undefined &&
      category.length > 100
    ) {
      return NextResponse.json(
        {
          error:
            "หมวดหมู่ต้องไม่เกิน 100 ตัวอักษร",
        },
        { status: 400 }
      );
    }

    // -------------------------------------------------
    // Status
    // -------------------------------------------------

    if (
      status !== undefined &&
      !ALLOWED_STATUS.includes(
        status as ArticleStatus
      )
    ) {
      return NextResponse.json(
        { error: "สถานะบทความไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    // -------------------------------------------------
    // AUTHOR
    // เปลี่ยนสถานะได้เฉพาะ DRAFT / PENDING
    //
    // ADMIN เปลี่ยนได้ทุกสถานะ
    // -------------------------------------------------

    if (role === "AUTHOR" && status !== undefined) {
      if (
        status !== "DRAFT" &&
        status !== "PENDING"
      ) {
        return NextResponse.json(
          {
            error:
              "AUTHOR สามารถเปลี่ยนสถานะได้เฉพาะ DRAFT หรือ PENDING",
          },
          { status: 403 }
        );
      }
    }

    // =================================================
    // สร้างข้อมูลที่จะ Update
    // =================================================

    const updateData: Record<string, unknown> = {};

    // -------------------------------------------------
    // Title + Slug
    // -------------------------------------------------

    if (title !== undefined) {
      updateData.title = title;

      const baseSlug =
        slugify(title, {
          lower: true,
          strict: true,
        }) || `article-${Date.now()}`;

      let newSlug = baseSlug;

      const existingArticle =
        await Article.findOne({
          slug: newSlug,
          _id: { $ne: id },
        }).select("_id");

      if (existingArticle) {
        newSlug = `${baseSlug}-${Date.now()}`;
      }

      updateData.slug = newSlug;
    }

    // -------------------------------------------------
    // Excerpt
    // -------------------------------------------------

    if (excerpt !== undefined) {
      updateData.excerpt = excerpt;
    }

    // -------------------------------------------------
    // Content
    // -------------------------------------------------

    if (content !== undefined) {
      updateData.content = content;
    }

    // -------------------------------------------------
    // Cover Image
    // -------------------------------------------------

    if (coverImage !== undefined) {
      updateData.coverImage = coverImage;
    }

    // -------------------------------------------------
    // Category
    // -------------------------------------------------

    if (category !== undefined) {
      updateData.category =
        category || "ทั่วไป";
    }

    // -------------------------------------------------
    // Status + PublishedAt
    // -------------------------------------------------

    if (status !== undefined) {
      updateData.status = status;

      if (status === "PUBLISHED") {
        updateData.publishedAt =
          article.publishedAt ?? new Date();
      } else {
        updateData.publishedAt = null;
      }
    }

    // -------------------------------------------------
    // ตรวจสอบว่ามีข้อมูลสำหรับแก้ไขหรือไม่
    // -------------------------------------------------

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "ไม่มีข้อมูลสำหรับแก้ไข" },
        { status: 400 }
      );
    }

    // =================================================
    // Update Database
    // =================================================

    const updatedArticle =
      await Article.findByIdAndUpdate(
        id,
        updateData,
        {
          new: true,
          runValidators: true,
        }
      )
        .populate("author", "name")
        .lean();

    if (!updatedArticle) {
      return NextResponse.json(
        { error: "ไม่พบบทความ" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "แก้ไขบทความสำเร็จ",
      article: updatedArticle,
    });
  } catch (error: any) {
    console.error(
      "PUT /api/articles/[id] error:",
      error
    );

    // MongoDB duplicate key
    if (error?.code === 11000) {
      return NextResponse.json(
        {
          error:
            "Slug ของบทความซ้ำ กรุณาลองใหม่อีกครั้ง",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "ไม่สามารถแก้ไขบทความได้" },
      { status: 500 }
    );
  }
}

// =====================================================
// DELETE /api/articles/[id]
// ลบบทความ
// =====================================================

export async function DELETE(
  _req: Request,
  { params }: RouteParams
) {
  try {
    // -------------------------------------------------
    // ตรวจสอบ Session
    // -------------------------------------------------

    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "กรุณาเข้าสู่ระบบก่อนลบบทความ" },
        { status: 401 }
      );
    }

    const role = (session.user as { role?: string }).role;
    const userId = (session.user as { id?: string }).id;

    // -------------------------------------------------
    // ตรวจสอบ Role
    // -------------------------------------------------

    if (role !== "AUTHOR" && role !== "ADMIN") {
      return NextResponse.json(
        { error: "คุณไม่มีสิทธิ์ลบบทความ" },
        { status: 403 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: "ไม่พบข้อมูลผู้ใช้งานใน Session" },
        { status: 401 }
      );
    }

    // -------------------------------------------------
    // ตรวจสอบ ID
    // -------------------------------------------------

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "รหัสบทความไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    await connectDB();

    // -------------------------------------------------
    // ค้นหาบทความ
    // -------------------------------------------------

    const article = await Article.findById(id);

    if (!article) {
      return NextResponse.json(
        { error: "ไม่พบบทความ" },
        { status: 404 }
      );
    }

    // -------------------------------------------------
    // AUTHOR ลบได้เฉพาะบทความตัวเอง
    // ADMIN ลบได้ทุกบทความ
    // -------------------------------------------------

    if (
      role === "AUTHOR" &&
      article.author.toString() !== userId
    ) {
      return NextResponse.json(
        { error: "คุณไม่มีสิทธิ์ลบบทความนี้" },
        { status: 403 }
      );
    }

    // -------------------------------------------------
    // ลบ
    // -------------------------------------------------

    await Article.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "ลบบทความสำเร็จ",
    });
  } catch (error) {
    console.error(
      "DELETE /api/articles/[id] error:",
      error
    );

    return NextResponse.json(
      { error: "ไม่สามารถลบบทความได้" },
      { status: 500 }
    );
  }
}