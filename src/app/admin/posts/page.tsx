"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import toast from "react-hot-toast";

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
  category?: string;
  status: ArticleStatus;
  author?: {
    name?: string;
  } | null;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string | null;
};

const statusLabels: Record<ArticleStatus, string> = {
  DRAFT: "ฉบับร่าง",
  PENDING: "รอตรวจสอบ",
  PUBLISHED: "เผยแพร่แล้ว",
  REJECTED: "ไม่อนุมัติ",
};

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState<
    "ALL" | ArticleStatus
  >("ALL");

  const [articleToDelete, setArticleToDelete] =
    useState<Article | null>(null);

  const [isDeleting, setIsDeleting] = useState(false);

  // ─────────────────────────────────────────────
  // โหลดบทความ
  // ─────────────────────────────────────────────

  const loadArticles = useCallback(
    async (showRefreshToast = false) => {
      try {
        setError("");

        if (showRefreshToast) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const res = await fetch(
          "/api/articles?status=ALL",
          {
            cache: "no-store",
          }
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data?.error ||
              "ไม่สามารถโหลดบทความได้"
          );
        }

        if (!Array.isArray(data)) {
          throw new Error(
            "ข้อมูลบทความไม่ถูกต้อง"
          );
        }

        setArticles(data);

        if (showRefreshToast) {
          toast.success(
            "รีเฟรชข้อมูลเรียบร้อย"
          );
        }
      } catch (error) {
        console.error(
          "Load articles error:",
          error
        );

        const message =
          error instanceof Error
            ? error.message
            : "โหลดบทความไม่สำเร็จ";

        setError(message);
        setArticles([]);

        toast.error(message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  // ─────────────────────────────────────────────
  // โหลดครั้งแรก
  // ─────────────────────────────────────────────

useEffect(() => {
  void loadArticles();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);
  // ─────────────────────────────────────────────
  // Statistics
  // ─────────────────────────────────────────────

  const publishedCount = articles.filter(
    (article) =>
      article.status === "PUBLISHED"
  ).length;

  const draftCount = articles.filter(
    (article) =>
      article.status === "DRAFT"
  ).length;

  const pendingCount = articles.filter(
    (article) =>
      article.status === "PENDING"
  ).length;

  const rejectedCount = articles.filter(
    (article) =>
      article.status === "REJECTED"
  ).length;

  // ─────────────────────────────────────────────
  // Search + Filter
  // ─────────────────────────────────────────────

  const filteredArticles = useMemo(() => {
    const keyword = search
      .trim()
      .toLowerCase();

    return articles.filter((article) => {
      const matchSearch =
        !keyword ||
        article.title
          .toLowerCase()
          .includes(keyword) ||
        article.slug
          .toLowerCase()
          .includes(keyword) ||
        article.category
          ?.toLowerCase()
          .includes(keyword) ||
        article.author?.name
          ?.toLowerCase()
          .includes(keyword);

      const matchStatus =
        statusFilter === "ALL" ||
        article.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [
    articles,
    search,
    statusFilter,
  ]);

  // ─────────────────────────────────────────────
  // Delete
  // ─────────────────────────────────────────────

  const handleDelete = async () => {
    if (
      !articleToDelete ||
      isDeleting
    ) {
      return;
    }

    setIsDeleting(true);

    const toastId = toast.loading(
      "กำลังลบบทความ..."
    );

    try {
      const res = await fetch(
        `/api/articles/${articleToDelete._id}`,
        {
          method: "DELETE",
        }
      );

      const data = await res
        .json()
        .catch(() => null);

      if (!res.ok) {
        throw new Error(
          data?.error ||
            "ไม่สามารถลบบทความได้"
        );
      }

      setArticles(
        (currentArticles) =>
          currentArticles.filter(
            (article) =>
              article._id !==
              articleToDelete._id
          )
      );

      setArticleToDelete(null);

      toast.success(
        "ลบบทความเรียบร้อย!",
        {
          id: toastId,
        }
      );
    } catch (error) {
      console.error(
        "Delete article error:",
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "ระบบขัดข้อง กรุณาลองใหม่",
        {
          id: toastId,
        }
      );
    } finally {
      setIsDeleting(false);
    }
  };

  // ─────────────────────────────────────────────
  // Date
  // ─────────────────────────────────────────────

  const formatDate = (
    date?: string | null
  ) => {
    if (!date) {
      return "-";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }

    return parsedDate.toLocaleDateString(
      "th-TH",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  // ─────────────────────────────────────────────
  // Status UI
  // ─────────────────────────────────────────────

  const getStatusClass = (
    status: ArticleStatus
  ) => {
    switch (status) {
      case "PUBLISHED":
        return "bg-emerald-50 text-emerald-600 border-emerald-100";

      case "PENDING":
        return "bg-amber-50 text-amber-600 border-amber-100";

      case "REJECTED":
        return "bg-red-50 text-red-600 border-red-100";

      case "DRAFT":
      default:
        return "bg-gray-100 text-gray-500 border-gray-200";
    }
  };

  const getDotClass = (
    status: ArticleStatus
  ) => {
    switch (status) {
      case "PUBLISHED":
        return "bg-emerald-500";

      case "PENDING":
        return "bg-amber-500";

      case "REJECTED":
        return "bg-red-500";

      case "DRAFT":
      default:
        return "bg-gray-400";
    }
  };

  return (
    <div className="space-y-8">
      {/* ─────────────────────────────────────────────
          Header
      ───────────────────────────────────────────── */}

      <div
        className="
          flex
          flex-col
          items-start
          justify-between
          gap-4
          rounded-3xl
          border
          border-gray-100
          bg-white
          p-6
          shadow-sm
          lg:flex-row
          lg:items-center
        "
      >
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-gray-900">
              จัดการบทความ
            </h1>

            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">
              Admin
            </span>
          </div>

          <p className="mt-1 text-sm text-gray-500">
            จัดการบทความทั้งหมดในระบบ
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() =>
              void loadArticles(true)
            }
            disabled={refreshing}
            className="
              rounded-2xl
              border
              border-gray-200
              bg-white
              px-5
              py-3
              font-semibold
              transition
              hover:bg-gray-50
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {refreshing
              ? "กำลังโหลด..."
              : "↻ รีเฟรช"}
          </button>

          <Link
            href="/admin/articles/create"
            className="
              rounded-2xl
              bg-gray-900
              px-6
              py-3
              font-medium
              text-white
              shadow-lg
              transition
              hover:bg-black
            "
          >
            + เขียนบทความใหม่
          </Link>
        </div>
      </div>

      {/* ─────────────────────────────────────────────
          Statistics
      ───────────────────────────────────────────── */}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <div className="rounded-2xl border border-gray-100 bg-white p-5">
          <p className="text-sm text-gray-500">
            ทั้งหมด
          </p>

          <p className="mt-2 text-3xl font-black text-gray-900">
            {articles.length}
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-white p-5">
          <p className="text-sm text-gray-500">
            เผยแพร่แล้ว
          </p>

          <p className="mt-2 text-3xl font-black text-emerald-600">
            {publishedCount}
          </p>
        </div>

        <div className="rounded-2xl border border-amber-100 bg-white p-5">
          <p className="text-sm text-gray-500">
            รอตรวจสอบ
          </p>

          <p className="mt-2 text-3xl font-black text-amber-600">
            {pendingCount}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5">
          <p className="text-sm text-gray-500">
            ฉบับร่าง
          </p>

          <p className="mt-2 text-3xl font-black text-gray-500">
            {draftCount}
          </p>
        </div>

        <div className="rounded-2xl border border-red-100 bg-white p-5">
          <p className="text-sm text-gray-500">
            ไม่อนุมัติ
          </p>

          <p className="mt-2 text-3xl font-black text-red-600">
            {rejectedCount}
          </p>
        </div>
      </div>

      {/* ─────────────────────────────────────────────
          Search / Filter
      ───────────────────────────────────────────── */}

      <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="flex-1">
            <label
              htmlFor="article-search"
              className="sr-only"
            >
              ค้นหาบทความ
            </label>

            <input
              id="article-search"
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="🔎 ค้นหาชื่อบทความ, slug, หมวดหมู่ หรือผู้เขียน..."
              className="
                w-full
                rounded-xl
                border
                border-gray-200
                bg-gray-50
                px-4
                py-3
                outline-none
                transition
                focus:bg-white
                focus:ring-2
                focus:ring-gray-900/10
              "
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value as
                  | "ALL"
                  | ArticleStatus
              )
            }
            aria-label="กรองสถานะบทความ"
            className="
              rounded-xl
              border
              border-gray-200
              bg-gray-50
              px-4
              py-3
              outline-none
            "
          >
            <option value="ALL">
              ทุกสถานะ
            </option>

            <option value="PUBLISHED">
              เผยแพร่แล้ว
            </option>

            <option value="PENDING">
              รอตรวจสอบ
            </option>

            <option value="DRAFT">
              ฉบับร่าง
            </option>

            <option value="REJECTED">
              ไม่อนุมัติ
            </option>
          </select>
        </div>

        {(search ||
          statusFilter !== "ALL") && (
          <div className="mt-4 flex items-center justify-between text-sm">
            <p className="text-gray-500">
              พบ {filteredArticles.length} บทความ
            </p>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("ALL");
              }}
              className="font-semibold text-gray-600 hover:text-black"
            >
              ล้างตัวกรอง
            </button>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────
          Error
      ───────────────────────────────────────────── */}

      {error ? (
        <div className="rounded-3xl border border-red-100 bg-red-50 p-10 text-center">
          <div className="mb-4 text-5xl">
            ⚠️
          </div>

          <h2 className="font-bold text-red-700">
            ไม่สามารถโหลดบทความได้
          </h2>

          <p className="mt-2 text-sm text-red-500">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              void loadArticles(true)
            }
            disabled={refreshing}
            className="
              mt-5
              rounded-xl
              bg-red-600
              px-5
              py-3
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-red-700
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {refreshing
              ? "กำลังโหลด..."
              : "ลองใหม่"}
          </button>
        </div>
      ) : (
        /* ─────────────────────────────────────────────
            Table
        ───────────────────────────────────────────── */

        <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
          {loading ? (
            <div className="p-16 text-center text-gray-400">
              กำลังโหลดบทความ...
            </div>
          ) : filteredArticles.length ===
            0 ? (
            <div className="p-16 text-center">
              <div className="mb-4 text-5xl">
                📝
              </div>

              <h2 className="font-bold text-gray-900">
                {articles.length === 0
                  ? "ยังไม่มีบทความ"
                  : "ไม่พบบทความ"}
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                {articles.length === 0
                  ? "เริ่มสร้างบทความแรกของ MickeyHub ได้เลย"
                  : "ลองเปลี่ยนคำค้นหาหรือตัวกรอง"}
              </p>

              {articles.length === 0 && (
                <Link
                  href="/admin/articles/create"
                  className="
                    mt-5
                    inline-block
                    rounded-xl
                    bg-gray-900
                    px-5
                    py-3
                    text-sm
                    font-semibold
                    text-white
                    transition
                    hover:bg-black
                  "
                >
                  สร้างบทความแรก
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="border-b border-gray-100 bg-gray-50">
                  <tr>
                    <th className="p-6 font-bold text-gray-500">
                      บทความ
                    </th>

                    <th className="p-6 font-bold text-gray-500">
                      ผู้เขียน
                    </th>

                    <th className="p-6 font-bold text-gray-500">
                      หมวดหมู่
                    </th>

                    <th className="p-6 font-bold text-gray-500">
                      สถานะ
                    </th>

                    <th className="p-6 font-bold text-gray-500">
                      วันที่
                    </th>

                    <th className="p-6 text-right font-bold text-gray-500">
                      จัดการ
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredArticles.map(
                    (article) => (
                      <tr
                        key={article._id}
                        className="transition hover:bg-gray-50"
                      >
                        {/* Article */}
                        <td className="p-6">
                          <div className="max-w-[320px]">
                            <p className="line-clamp-1 text-base font-bold text-gray-900">
                              {article.title}
                            </p>

                            <p className="mt-1 line-clamp-1 text-xs text-gray-400">
                              /{article.slug}
                            </p>
                          </div>
                        </td>

                        {/* Author */}
                        <td className="p-6">
                          <span className="text-sm text-gray-600">
                            {article.author?.name ||
                              "MickeyHub"}
                          </span>
                        </td>

                        {/* Category */}
                        <td className="p-6">
                          {article.category ? (
                            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                              {article.category}
                            </span>
                          ) : (
                            <span className="text-gray-400">
                              -
                            </span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="p-6">
                          <span
                            className={`
                              inline-flex
                              items-center
                              rounded-full
                              border
                              px-3
                              py-1
                              text-xs
                              font-bold
                              ${getStatusClass(
                                article.status
                              )}
                            `}
                          >
                            <span
                              className={`
                                mr-2
                                h-1.5
                                w-1.5
                                rounded-full
                                ${getDotClass(
                                  article.status
                                )}
                              `}
                            />

                            {
                              statusLabels[
                                article.status
                              ]
                            }
                          </span>
                        </td>

                        {/* Date */}
                        <td className="p-6">
                          <time
                            dateTime={
                              article.publishedAt ||
                              article.createdAt
                            }
                            className="text-xs text-gray-500"
                          >
                            {formatDate(
                              article.publishedAt ||
                                article.createdAt
                            )}
                          </time>
                        </td>

                        {/* Actions */}
                        <td className="p-6 text-right">
                          <div className="inline-flex items-center gap-4">
                            {article.status ===
                              "PUBLISHED" && (
                              <Link
                                href={`/blog/${article.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-semibold text-gray-500 transition hover:text-green-600"
                              >
                                ดู
                              </Link>
                            )}

                            <Link
                              href={`/admin/articles/${article._id}/edit`}
                              className="font-semibold text-gray-600 transition hover:text-blue-600"
                            >
                              แก้ไข
                            </Link>

                            <button
                              type="button"
                              onClick={() =>
                                setArticleToDelete(
                                  article
                                )
                              }
                              disabled={isDeleting}
                              className="
                                font-semibold
                                text-red-500
                                transition
                                hover:text-red-700
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                              "
                            >
                              ลบ
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────
          Delete Modal
      ───────────────────────────────────────────── */}

      {articleToDelete && (
        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-black/40
            p-4
            backdrop-blur-sm
          "
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-article-title"
          onMouseDown={(event) => {
            if (
              event.target ===
                event.currentTarget &&
              !isDeleting
            ) {
              setArticleToDelete(null);
            }
          }}
        >
          <div className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-2xl">
            <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-xl text-red-500">
              ⚠️
            </div>

            <h3
              id="delete-article-title"
              className="mb-2 text-center text-xl font-black text-gray-900"
            >
              ยืนยันการลบบทความ?
            </h3>

            <p className="mb-8 text-center text-sm leading-relaxed text-gray-500">
              คุณต้องการลบบทความ{" "}
              <span className="font-bold text-gray-800">
               {articleToDelete.title}
              </span>{" "}
              ใช่ไหม?
              <br />
              การกระทำนี้ไม่สามารถกู้คืนได้
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() =>
                  setArticleToDelete(null)
                }
                disabled={isDeleting}
                className="
                  flex-1
                  rounded-xl
                  border
                  border-gray-200
                  py-3
                  font-semibold
                  transition
                  hover:bg-gray-50
                  disabled:opacity-50
                "
              >
                ยกเลิก
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="
                  flex-1
                  rounded-xl
                  bg-red-600
                  py-3
                  font-semibold
                  text-white
                  transition
                  hover:bg-red-700
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                {isDeleting
                  ? "กำลังลบ...": "ลบทิ้งทันที"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  }