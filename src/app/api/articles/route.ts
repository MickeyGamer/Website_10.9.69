import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import { Article } from "@/models/Article";
import slugify from "slugify";

// =====================================================
// Article Status
// =====================================================

const ALLOWED_STATUS = [
  "DRAFT",
  "PENDING",
  "PUBLISHED",
  "REJECTED",
] as const;

type ArticleStatus = (typeof ALLOWED_STATUS)[number];

interface SessionUser {
  id?: string;
  role?: string;
}

interface ArticleRequestBody {
  title?: unknown;
  excerpt?: unknown;
  content?: unknown;
  coverImage?: unknown;
  category?: unknown;
  status?: unknown;
}

// =====================================================
// GET /api/articles
// =====================================================

export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);

    const requestedStatus = searchParams.get("status");
    const category = searchParams.get("category");

    // =====================================================
    // ตรวจสอบ Status
    // =====================================================

    if (
      requestedStatus &&
      !ALLOWED_STATUS.includes(
        requestedStatus as ArticleStatus
      )
    ) {
      return NextResponse.json(
        { error: "สถานะบทความไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    // =====================================================
    // ตรวจสอบ Session
    // =====================================================

    const session = await auth();

    const user = session?.user as SessionUser | undefined;

    const role = user?.role;
    const userId = user?.id;

    // =====================================================
    // สร้าง Filter
    // =====================================================

    const filter: Record<string, unknown> = {};

    // =====================================================
    // ADMIN
    // =====================================================

    if (role === "ADMIN") {
      if (requestedStatus) {
        filter.status = requestedStatus;
      }
    }

    // =====================================================
    // AUTHOR
    // =====================================================

    else if (role === "AUTHOR" && userId) {
      if (requestedStatus) {
        filter.status = requestedStatus;
        filter.author = userId;
      } else {
        filter.status = "PUBLISHED";
      }
    }

    // =====================================================
    // USER / GUEST
    // =====================================================

    else {
      filter.status = "PUBLISHED";
    }

    // =====================================================
    // Category
    // =====================================================

    if (category) {
      filter.category = category;
    }

    // =====================================================
    // Query
    // =====================================================

    const articles = await Article.find(filter)
      .populate("author", "name email")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(articles, {
      status: 200,
    });
  } catch (error: unknown) {
    console.error(
      "GET /api/articles error:",
      error
    );

    return NextResponse.json(
      {
        error: "ไม่สามารถโหลดบทความได้",
      },
      {
        status: 500,
      }
    );
  }
}

// =====================================================
// POST /api/articles
// =====================================================

export async function POST(req: Request) {
  try {
    // =====================================================
    // ตรวจสอบ Login
    // =====================================================

    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        {
          error: "กรุณาเข้าสู่ระบบก่อนสร้างบทความ",
        },
        {
          status: 401,
        }
      );
    }

    // =====================================================
    // ตรวจสอบ User
    // =====================================================

    const user = session.user as SessionUser;

    const role = user.role;
    const authorId = user.id;

    // =====================================================
    // ตรวจสอบ Role
    // =====================================================

    if (role !== "AUTHOR" && role !== "ADMIN") {
      return NextResponse.json(
        {
          error: "คุณไม่มีสิทธิ์สร้างบทความ",
        },
        {
          status: 403,
        }
      );
    }

    // =====================================================
    // ตรวจสอบ User ID
    // =====================================================

    if (!authorId) {
      return NextResponse.json(
        {
          error: "ไม่พบข้อมูลผู้เขียน",
        },
        {
          status: 401,
        }
      );
    }

    // =====================================================
    // อ่าน JSON
    // =====================================================

    let body: ArticleRequestBody;

    try {
      body = (await req.json()) as ArticleRequestBody;
    } catch {
      return NextResponse.json(
        {
          error: "ข้อมูลที่ส่งมาไม่ถูกต้อง",
        },
        {
          status: 400,
        }
      );
    }

    // =====================================================
    // รับข้อมูล
    // =====================================================

    const title =
      typeof body.title === "string"
        ? body.title.trim()
        : "";

    const excerpt =
      typeof body.excerpt === "string"
        ? body.excerpt.trim()
        : "";

    const content =
      typeof body.content === "string"
        ? body.content.trim()
        : "";

    const coverImage =
      typeof body.coverImage === "string"
        ? body.coverImage.trim()
        : "";

    const category =
      typeof body.category === "string"
        ? body.category.trim()
        : "ทั่วไป";

    // =====================================================
    // Validation
    // =====================================================

    if (!title) {
      return NextResponse.json(
        {
          error: "กรุณากรอกชื่อบทความ",
        },
        {
          status: 400,
        }
      );
    }

    if (title.length < 3 || title.length > 200) {
      return NextResponse.json(
        {
          error:
            "ชื่อบทความต้องมีความยาว 3-200 ตัวอักษร",
        },
        {
          status: 400,
        }
      );
    }

    if (!content) {
      return NextResponse.json(
        {
          error: "กรุณากรอกเนื้อหาบทความ",
        },
        {
          status: 400,
        }
      );
    }

    if (excerpt.length > 500) {
      return NextResponse.json(
        {
          error: "คำโปรยต้องไม่เกิน 500 ตัวอักษร",
        },
        {
          status: 400,
        }
      );
    }

    // =====================================================
    // Connect Database
    // =====================================================

    await connectDB();

    // =====================================================
    // สร้าง Slug
    // =====================================================

    const baseSlug =
      slugify(title, {
        lower: true,
        strict: true,
      }) || `article-${Date.now()}`;

    let slug = baseSlug;

    const existingArticle = await Article.findOne({
      slug,
    }).select("_id");

    if (existingArticle) {
      slug = `${baseSlug}-${Date.now()}`;
    }

    // =====================================================
    // กำหนด Status
    // AUTHOR -> DRAFT
    // ADMIN  -> PUBLISHED ได้ถ้าระบุมา
    // =====================================================

    const status: ArticleStatus =
      role === "ADMIN" &&
      body.status === "PUBLISHED"
        ? "PUBLISHED"
        : "DRAFT";

    // =====================================================
    // สร้าง Article
    // =====================================================

    const article = await Article.create({
      title,
      slug,
      excerpt,
      content,
      coverImage,
      category,
      author: authorId,
      status,
      publishedAt:
        status === "PUBLISHED"
          ? new Date()
          : null,
    });

    // =====================================================
    // Response
    // =====================================================

    return NextResponse.json(
      {
        success: true,
        message: "สร้างบทความสำเร็จ",
        article,
      },
      {
        status: 201,
      }
    );
  } catch (error: unknown) {
    console.error(
      "POST /api/articles error:",
      error
    );

    // =====================================================
    // MongoDB Duplicate Key
    // =====================================================

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: unknown }).code === 11000
    ) {
      return NextResponse.json(
        {
          error:
            "Slug ของบทความซ้ำ กรุณาลองใหม่อีกครั้ง",
        },
        {
          status: 400,
        }
      );
    }

    return NextResponse.json(
      {
        error:
          "ไม่สามารถสร้างบทความได้ กรุณาลองใหม่อีกครั้ง",
      },
      {
        status: 500,
      }
    );
  }
}