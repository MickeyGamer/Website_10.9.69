"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

type ArticleStatus =
  | "DRAFT"
  | "PENDING"
  | "PUBLISHED"
  | "REJECTED";

type UserRole =
  | "ADMIN"
  | "CREATOR"
  | "USER";

interface Article {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  category?: string;
  coverImage?: string;
  status: ArticleStatus;

  author?: {
    _id?: string;
    name?: string;
    email?: string;
    role?: UserRole;
  } | null;

  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string | null;
}

interface Permissions {
  canView: boolean;
  canEdit: boolean;
  canReview: boolean;
  canComment: boolean;
  canPublish: boolean;
  canReject: boolean;
  canDelete: boolean;
}

const statusLabels: Record<ArticleStatus, string> = {
  DRAFT: "ฉบับร่าง",
  PENDING: "รอตรวจสอบ",
  PUBLISHED: "เผยแพร่แล้ว",
  REJECTED: "ไม่อนุมัติ",
};

const statusClasses: Record<ArticleStatus, string> = {
  DRAFT:
    "bg-gray-100 text-gray-700 border-gray-200",
  PENDING:
    "bg-amber-50 text-amber-700 border-amber-200",
  PUBLISHED:
    "bg-emerald-50 text-emerald-700 border-emerald-200",
  REJECTED:
    "bg-red-50 text-red-700 border-red-200",
};

export default function AdminArticleEditPage() {
  const params = useParams();
  const router = useRouter();

  const { data: session, status: sessionStatus } =
    useSession();

  const articleId = String(params.id);

  const [article, setArticle] =
    useState<Article | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] =
    useState("");

  const [reviewComment, setReviewComment] =
    useState("");

  // ==========================================
  // ตรวจสอบผู้ใช้
  // ==========================================

  const currentUser = session?.user as
    | {
        id?: string;
        name?: string | null;
        email?: string | null;
        role?: UserRole;
      }
    | undefined;

  const currentUserRole =
    currentUser?.role || "USER";

  const isAdmin =
    currentUserRole === "ADMIN";

  // ==========================================
  // สิทธิ์ของ Admin
  // ==========================================

  const permissions: Permissions = useMemo(() => {
    if (isAdmin) {
      return {
        canView: true,
        canEdit: true,
        canReview: true,
        canComment: true,
        canPublish: true,
        canReject: true,
        canDelete: true,
      };
    }

    return {
      canView: true,
      canEdit: false,
      canReview: false,
      canComment: false,
      canPublish: false,
      canReject: false,
      canDelete: false,
    };
  }, [isAdmin]);

  // ==========================================
  // โหลดบทความ
  // ==========================================

  useEffect(() => {
    if (sessionStatus === "loading") {
      return;
    }

    if (sessionStatus === "unauthenticated") {
      toast.error(
        "กรุณาเข้าสู่ระบบก่อน"
      );

      router.replace("/login");
      return;
    }

    const loadArticle = async () => {
      try {
        setLoading(true);

        const response = await fetch(
          `/api/articles/${articleId}`,
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error ||
              "ไม่สามารถโหลดบทความได้"
          );
        }

        setArticle(data);

        setTitle(data.title || "");
        setExcerpt(data.excerpt || "");
        setCategory(data.category || "");
        setContent(data.content || "");
        setCoverImage(
          data.coverImage || ""
        );
      } catch (error) {
        console.error(
          "Load article error:",
          error
        );

        toast.error(
          error instanceof Error
            ? error.message
            : "ไม่สามารถโหลดบทความได้"
        );
      } finally {
        setLoading(false);
      }
    };

    if (articleId) {
      void loadArticle();
    }
  }, [
    articleId,
    router,
    sessionStatus,
  ]);

  // ==========================================
  // บันทึกการแก้ไข
  // ==========================================

  const handleSave = async () => {
    if (!permissions.canEdit) {
      toast.error(
        "คุณไม่มีสิทธิ์แก้ไขบทความนี้"
      );
      return;
    }

    if (!title.trim()) {
      toast.error(
        "กรุณากรอกชื่อบทความ"
      );
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        `/api/articles/${articleId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            title,
            excerpt,
            category,
            content,
            coverImage,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "ไม่สามารถบันทึกบทความได้"
        );
      }

      setArticle(data);

      toast.success(
        "บันทึกบทความเรียบร้อย"
      );
    } catch (error) {
      console.error(
        "Update article error:",
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "บันทึกบทความไม่สำเร็จ"
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // สถานะบทความ
  // ==========================================

  const handleStatusChange = async (
    newStatus: ArticleStatus
  ) => {
    if (!isAdmin) {
      toast.error(
        "เฉพาะ Admin เท่านั้น"
      );
      return;
    }

    try {
      const response = await fetch(
        `/api/articles/${articleId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            title,
            excerpt,
            category,
            content,
            coverImage,
            status: newStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "ไม่สามารถเปลี่ยนสถานะได้"
        );
      }

      setArticle(data);

      toast.success(
        `เปลี่ยนสถานะเป็น ${statusLabels[newStatus]}`
      );
    } catch (error) {
      console.error(
        "Status update error:",
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "เปลี่ยนสถานะไม่สำเร็จ"
      );
    }
  };

  // ==========================================
  // ลบบทความ
  // ==========================================

  const handleDelete = async () => {
    if (!permissions.canDelete) {
      toast.error(
        "คุณไม่มีสิทธิ์ลบบทความ"
      );
      return;
    }

    const confirmed = window.confirm(
      `ต้องการลบบทความ "${article?.title}" หรือไม่?`
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `/api/articles/${articleId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "ไม่สามารถลบบทความได้"
        );
      }

      toast.success(
        "ลบบทความเรียบร้อย"
      );

      router.push(
        "/admin/articles"
      );
    } catch (error) {
      console.error(
        "Delete article error:",
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "ลบบทความไม่สำเร็จ"
      );
    }
  };

  // ==========================================
  // Loading
  // ==========================================

  if (
    sessionStatus === "loading" ||
    loading
  ) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border bg-white p-10 text-center shadow-sm">
            <p className="text-gray-500">
              กำลังตรวจสอบสิทธิ์และโหลดบทความ...
            </p>
          </div>
        </div>
      </main>
    );
  }

  // ==========================================
  // ไม่มีสิทธิ์เข้าหน้า Admin
  // ==========================================

  if (!isAdmin) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-red-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-3xl">
              🔒
            </div>

            <h1 className="text-2xl font-bold text-gray-900">
              ไม่มีสิทธิ์เข้าถึง
            </h1>

            <p className="mt-2 text-gray-500">
              บัญชีของคุณไม่มีสิทธิ์ใช้งาน
              ระบบจัดการบทความของ Admin
            </p>

            <div className="mt-6 rounded-xl bg-gray-50 p-4 text-left">
              <p>
                ผู้ใช้งาน:{" "}
                <strong>
                  {currentUser?.name ||
                    "ไม่ทราบชื่อ"}
                </strong>
              </p>

              <p className="mt-1">
                สิทธิ์:{" "}
                <strong>
                  {currentUserRole}
                </strong>
              </p>
            </div>

            <Link
              href="/admin/articles"
              className="mt-6 inline-flex rounded-xl bg-gray-900 px-5 py-3 font-medium text-white hover:bg-gray-800"
            >
              กลับหน้าบทความ
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!article) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border bg-white p-10 text-center">
            <h1 className="text-xl font-bold">
              ไม่พบบทความ
            </h1>

            <Link
              href="/admin/articles"
              className="mt-5 inline-block text-blue-600 hover:underline"
            >
              ← กลับรายการบทความ
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ==========================================
  // หน้า Edit
  // ==========================================

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* Header */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <Link
              href="/admin/articles"
              className="text-sm text-gray-500 hover:text-gray-900"
            >
              ← กลับจัดการบทความ
            </Link>

            <h1 className="mt-2 text-3xl font-bold text-gray-900">
              ตรวจสอบและแก้ไขบทความ
            </h1>

            <p className="mt-1 text-gray-500">
              ตรวจสอบสิทธิ์ ตรวจสอบเนื้อหา
              และจัดการสถานะบทความ
            </p>
          </div>

          <span
            className={`inline-flex w-fit rounded-full border px-4 py-2 text-sm font-semibold ${statusClasses[article.status]}`}
          >
            {statusLabels[article.status]}
          </span>
        </div>

        {/* Permission Panel */}
        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-bold text-gray-900">
              🛡️ สิทธิ์การเข้าถึงระบบบทความ
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              ระบบตรวจสอบสิทธิ์ของผู้ใช้งานปัจจุบัน
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

            <PermissionCard
              icon="👁️"
              title="ดูบทความ"
              allowed={permissions.canView}
            />

            <PermissionCard
              icon="✏️"
              title="แก้ไขบทความ"
              allowed={permissions.canEdit}
            />

            <PermissionCard
              icon="🔎"
              title="ตรวจสอบบทความ"
              allowed={permissions.canReview}
            />

            <PermissionCard
              icon="💬"
              title="แสดงความคิดเห็น"
              allowed={permissions.canComment}
            />

            <PermissionCard
              icon="✅"
              title="อนุมัติ / เผยแพร่"
              allowed={permissions.canPublish}
            />

            <PermissionCard
              icon="❌"
              title="ปฏิเสธบทความ"
              allowed={permissions.canReject}
            />

            <PermissionCard
              icon="🗑️"
              title="ลบบทความ"
              allowed={permissions.canDelete}
            />

            <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
              <p className="text-xs text-blue-600">
                ระดับสิทธิ์ปัจจุบัน
              </p>

              <p className="mt-1 font-bold text-blue-900">
                {currentUserRole}
              </p>
            </div>
          </div>
        </section>

        {/* Article information */}
        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold">
            👤 ข้อมูลบทความ
          </h2>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <InfoBox
              label="ผู้เขียน"
              value={
                article.author?.name ||
                "ไม่ระบุ"
              }
            />

            <InfoBox
              label="อีเมลผู้เขียน"
              value={
                article.author?.email ||
                "-"
              }
            />

            <InfoBox
              label="สิทธิ์ผู้เขียน"
              value={
                article.author?.role ||
                "ไม่ระบุ"
              }
            />
          </div>
        </section>

        {/* Editor */}
        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold">
            ✏️ แก้ไขบทความ
          </h2>

          <div className="mt-6 space-y-5">

            <div>
              <label className="mb-2 block text-sm font-semibold">
                ชื่อบทความ
              </label>

              <input
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                disabled={!permissions.canEdit}
                className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                คำอธิบาย
              </label>

              <textarea
                value={excerpt}
                onChange={(e) =>
                  setExcerpt(e.target.value)
                }
                disabled={!permissions.canEdit}
                rows={3}
                className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                หมวดหมู่
              </label>

              <input
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value)
                }
                disabled={!permissions.canEdit}
                className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                รูปปก
              </label>

              <input
                value={coverImage}
                onChange={(e) =>
                  setCoverImage(e.target.value)
                }
                disabled={!permissions.canEdit}
                placeholder="URL รูปภาพ"
                className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                เนื้อหา
              </label>

              <textarea
                value={content}
                onChange={(e) =>
                  setContent(e.target.value)
                }
                disabled={!permissions.canEdit}
                rows={18}
                className="w-full rounded-xl border px-4 py-3 font-mono text-sm outline-none focus:border-blue-500 disabled:bg-gray-100"
              />
            </div>

            {permissions.canEdit && (
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving
                    ? "กำลังบันทึก..."
                    : "💾 บันทึกการแก้ไข"}
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Review */}
        {permissions.canReview && (
          <section className="rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold">
              🔎 ตรวจสอบบทความ
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              ใช้ส่วนนี้สำหรับบันทึกความคิดเห็น
              หรือข้อเสนอแนะจากการตรวจบทความ
            </p>

            <textarea
              value={reviewComment}
              onChange={(e) =>
                setReviewComment(
                  e.target.value
                )
              }
              rows={5}
              placeholder="เขียนความคิดเห็นเกี่ยวกับบทความ..."
              className="mt-4 w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-500"
            />

            <button
              type="button"
              onClick={() =>
                toast.success(
                  "บันทึกความคิดเห็นสำหรับการตรวจสอบแล้ว"
                )
              }
              className="mt-3 rounded-xl border border-gray-300 px-5 py-3 font-medium hover:bg-gray-50"
            >
              💬 บันทึกความคิดเห็น
            </button>
          </section>
        )}

        {/* Admin actions */}
        {isAdmin && (
          <section className="rounded-2xl border border-purple-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold">
              ⚙️ การจัดการของ Admin
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              การดำเนินการเหล่านี้มีผลต่อสถานะ
              และการแสดงบทความบนเว็บไซต์
            </p>

            <div className="mt-5 flex flex-wrap gap-3">

              <button
                type="button"
                onClick={() =>
                  handleStatusChange(
                    "PUBLISHED"
                  )
                }
                className="rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700"
              >
                ✅ อนุมัติและเผยแพร่
              </button>

              <button
                type="button"
                onClick={() =>
                  handleStatusChange(
                    "REJECTED"
                  )
                }
                className="rounded-xl bg-red-600 px-5 py-3 font-semibold text-white hover:bg-red-700"
              >
                ❌ ไม่อนุมัติ
              </button>

              <button
                type="button"
                onClick={() =>
                  handleStatusChange(
                    "PENDING"
                  )
                }
                className="rounded-xl bg-amber-500 px-5 py-3 font-semibold text-white hover:bg-amber-600"
              >
                🔎 ส่งกลับตรวจสอบ
              </button>

              <button
                type="button"
                onClick={handleDelete}
                className="rounded-xl border border-red-200 px-5 py-3 font-semibold text-red-600 hover:bg-red-50"
              >
                🗑️ ลบบทความ
              </button>
            </div>
          </section>
        )}

      </div>
    </main>
  );
}

// ==========================================
// Permission Card
// ==========================================

function PermissionCard({
  icon,
  title,
  allowed,
}: {
  icon: string;
  title: string;
  allowed: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        allowed
          ? "border-emerald-100 bg-emerald-50"
          : "border-gray-200 bg-gray-50"
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="text-xl">
          {icon}
        </span>

        <div>
          <p className="text-sm font-semibold text-gray-900">
            {title}
          </p>

          <p
            className={`mt-1 text-xs font-medium ${
              allowed
                ? "text-emerald-600"
                : "text-gray-500"
            }`}
          >
            {allowed
              ? "มีสิทธิ์"
              : "ไม่มีสิทธิ์"}
          </p>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// Info Box
// ==========================================

function InfoBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border bg-gray-50 p-4">
      <p className="text-xs text-gray-500">
        {label}
      </p>

      <p className="mt-1 font-semibold text-gray-900">
        {value}
      </p>
    </div>
  );
}