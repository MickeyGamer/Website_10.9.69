"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";

type ArticleStatus =
  | "DRAFT"
  | "PENDING"
  | "PUBLISHED"
  | "REJECTED";

type Article = {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  status: ArticleStatus;
  author?: {
    name?: string;
  } | null;
  createdAt: string;
  updatedAt?: string;
};

const statusLabels: Record<ArticleStatus, string> = {
  DRAFT: "ฉบับร่าง",
  PENDING: "รอตรวจสอบ",
  PUBLISHED: "เผยแพร่แล้ว",
  REJECTED: "ไม่ผ่าน",
};

const statusStyles: Record<ArticleStatus, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  PENDING: "bg-yellow-100 text-yellow-700",
  PUBLISHED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
};

export default function AdminArticlesPage() {
  const { data: session, status: sessionStatus } = useSession();

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | ArticleStatus
  >("ALL");

  const userRole = (session?.user as { role?: string } | undefined)?.role;

  const isAdmin = userRole === "ADMIN";

  useEffect(() => {
    if (sessionStatus !== "authenticated") return;

    const loadArticles = async () => {
      try {
        setLoading(true);

        const response = await fetch("/api/articles?status=ALL", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("ไม่สามารถโหลดบทความได้");
        }

        const data = await response.json();

        const articleList = Array.isArray(data)
          ? data
          : Array.isArray(data.articles)
            ? data.articles
            : [];

        setArticles(articleList);
      } catch (error) {
        console.error(error);
        toast.error("โหลดรายการบทความไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    };

    loadArticles();
  }, [sessionStatus]);

  const stats = useMemo(() => {
    return {
      total: articles.length,
      draft: articles.filter((article) => article.status === "DRAFT")
        .length,
      pending: articles.filter(
        (article) => article.status === "PENDING"
      ).length,
      published: articles.filter(
        (article) => article.status === "PUBLISHED"
      ).length,
      rejected: articles.filter(
        (article) => article.status === "REJECTED"
      ).length,
    };
  }, [articles]);

  const filteredArticles = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return articles.filter((article) => {
      const matchesSearch =
        !keyword ||
        article.title.toLowerCase().includes(keyword) ||
        article.slug.toLowerCase().includes(keyword) ||
        article.author?.name?.toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === "ALL" ||
        article.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [articles, search, statusFilter]);

  const handleDelete = async (id: string) => {
    if (!isAdmin) {
      toast.error("เฉพาะ Admin เท่านั้นที่สามารถลบบทความได้");
      return;
    }

    const confirmed = window.confirm(
      "ต้องการลบบทความนี้ใช่หรือไม่?"
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);

      const response = await fetch(`/api/articles/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "ไม่สามารถลบบทความได้"
        );
      }

      setArticles((current) =>
        current.filter((article) => article._id !== id)
      );

      toast.success("ลบบทความเรียบร้อยแล้ว");
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "ลบบทความไม่สำเร็จ"
      );
    } finally {
      setDeletingId(null);
    }
  };

  if (sessionStatus === "loading") {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
            กำลังตรวจสอบสิทธิ์...
          </div>
        </div>
      </main>
    );
  }

  if (sessionStatus !== "authenticated") {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-red-200 bg-white p-8 text-center">
            <h1 className="text-xl font-bold text-gray-900">
              กรุณาเข้าสู่ระบบ
            </h1>

            <p className="mt-2 text-gray-500">
              คุณต้องเข้าสู่ระบบเพื่อเข้าถึงหน้านี้
            </p>

            <Link
              href="/login"
              className="mt-5 inline-flex rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800"
            >
              ไปหน้าเข้าสู่ระบบ
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-600">
              ADMIN
            </p>

            <h1 className="mt-1 text-3xl font-black text-gray-900">
              จัดการบทความ
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              จัดการ ตรวจสอบ และดูสถานะบทความทั้งหมด
            </p>
          </div>

          <Link
            href="/creator/create"
            className="inline-flex items-center justify-center rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800"
          >
            + สร้างบทความ
          </Link>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-5">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              บทความทั้งหมด
            </p>
            <p className="mt-2 text-3xl font-black text-gray-900">
              {stats.total}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              ฉบับร่าง
            </p>
            <p className="mt-2 text-3xl font-black text-gray-700">
              {stats.draft}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              รอตรวจสอบ
            </p>
            <p className="mt-2 text-3xl font-black text-yellow-600">
              {stats.pending}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              เผยแพร่แล้ว
            </p>
            <p className="mt-2 text-3xl font-black text-green-600">
              {stats.published}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">
              ไม่ผ่าน
            </p>
            <p className="mt-2 text-3xl font-black text-red-600">
              {stats.rejected}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1">
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                ค้นหาบทความ
              </label>

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="ค้นหาจากชื่อบทความ, slug หรือผู้เขียน..."
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="md:w-56">
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                สถานะ
              </label>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value as
                      | "ALL"
                      | ArticleStatus
                  )
                }
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="ALL">ทั้งหมด</option>
                <option value="DRAFT">ฉบับร่าง</option>
                <option value="PENDING">รอตรวจสอบ</option>
                <option value="PUBLISHED">
                  เผยแพร่แล้ว
                </option>
                <option value="REJECTED">ไม่ผ่าน</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                    บทความ
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                    ผู้เขียน
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                    สถานะ
                  </th>

                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wide text-gray-500">
                    วันที่
                  </th>

                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wide text-gray-500">
                    จัดการ
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center text-sm text-gray-500"
                    >
                      กำลังโหลดบทความ...
                    </td>
                  </tr>
                ) : filteredArticles.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-12 text-center"
                    >
                      <p className="font-semibold text-gray-700">
                        ไม่พบบทความ
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        ลองเปลี่ยนคำค้นหาหรือตัวกรอง
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredArticles.map((article) => (
                    <tr
                      key={article._id}
                      className="transition hover:bg-gray-50"
                    >
                      <td className="px-6 py-5">
                        <div className="max-w-md">
                          <p className="font-semibold text-gray-900">
                            {article.title}
                          </p>

                          <p className="mt-1 truncate text-xs text-gray-400">
                            /blog/{article.slug}
                          </p>

                          {article.excerpt && (
                            <p className="mt-2 line-clamp-2 text-sm text-gray-500">
                              {article.excerpt}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-5 text-sm text-gray-600">
                        {article.author?.name || "ไม่ระบุ"}
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                            statusStyles[article.status]
                          }`}
                        >
                          {statusLabels[article.status]}
                        </span>
                      </td>

                      <td className="px-6 py-5 text-sm text-gray-500">
                        {new Date(
                          article.createdAt
                        ).toLocaleDateString("th-TH", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/blog/${article.slug}`}
                            target="_blank"
                            className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                          >
                            ดู
                          </Link>

                          <Link
                            href={`/admin/articles/${article._id}/edit`}
                            className="rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-100"
                          >
                            แก้ไข
                          </Link>

                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() =>
                                handleDelete(article._id)
                              }
                              disabled={
                                deletingId === article._id
                              }
                              className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {deletingId === article._id
                                ? "กำลังลบ..."
                                : "ลบ"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!loading && filteredArticles.length > 0 && (
            <div className="border-t border-gray-100 px-6 py-4 text-sm text-gray-500">
              แสดง {filteredArticles.length} จาก{" "}
              {articles.length} บทความ
            </div>
          )}
        </div>
      </div>
    </main>
  );
}