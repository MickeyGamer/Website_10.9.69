"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface Article {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ArticlesResponse {
  articles?: Article[];
}

export default function CreatorArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadArticles = async () => {
      try {
        setLoading(true);

        const response = await fetch("/api/articles", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("โหลดบทความไม่สำเร็จ");
        }

        const data: unknown = await response.json();

        if (Array.isArray(data)) {
          setArticles(data as Article[]);
        } else if (
          typeof data === "object" &&
          data !== null &&
          "articles" in data
        ) {
          const responseData = data as ArticlesResponse;
          setArticles(responseData.articles ?? []);
        } else {
          setArticles([]);
        }
      } catch (error) {
        console.error("Load articles error:", error);
        toast.error("ไม่สามารถโหลดบทความได้");
      } finally {
        setLoading(false);
      }
    };

    loadArticles();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-600">
              Creator
            </p>

            <h1 className="mt-1 text-3xl font-black text-gray-900">
              บทความของฉัน
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              จัดการบทความที่คุณสร้าง
            </p>
          </div>

          <Link
            href="/creator/articles/create"
            className="inline-flex items-center justify-center rounded-xl bg-zinc-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-600"
          >
            + สร้างบทความ
          </Link>
        </div>

        {/* Loading */}
        {loading && (
          <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
            <div className="mx-auto h-7 w-7 animate-spin rounded-full border-4 border-gray-200 border-t-zinc-900" />

            <p className="mt-4 text-sm text-gray-500">
              กำลังโหลดบทความ...
            </p>
          </div>
        )}

        {/* Empty */}
        {!loading && articles.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <div className="text-5xl">
              📝
            </div>

            <h2 className="mt-4 text-xl font-bold text-gray-900">
              ยังไม่มีบทความ
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              เริ่มสร้างบทความแรกของคุณได้เลย
            </p>

            <Link
              href="/creator/articles/create"
              className="mt-6 inline-flex rounded-xl bg-zinc-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-600"
            >
              สร้างบทความ
            </Link>
          </div>
        )}

        {/* Articles */}
        {!loading && articles.length > 0 && (
          <div className="grid gap-4">
            {articles.map((article) => (
              <article
                key={article._id}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

                  {/* Article information */}
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-bold text-gray-900">
                      {article.title}
                    </h2>

                    {article.excerpt && (
                      <p className="mt-2 line-clamp-2 text-sm text-gray-500">
                        {article.excerpt}
                      </p>
                    )}

                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-600">
                        {article.status || "DRAFT"}
                      </span>

                      {article.updatedAt && (
                        <span className="text-gray-400">
                          อัปเดต{" "}
                          {new Date(
                            article.updatedAt
                          ).toLocaleDateString("th-TH")}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 gap-2">
                    <Link
                      href={`/creator/articles/${article._id}/edit`}
                      className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
                    >
                      แก้ไข
                    </Link>

                    <Link
                      href={`/blog/${article.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-xl bg-gray-100 px-4 py-2 text-sm font-bold text-gray-700 transition hover:bg-gray-200"
                    >
                      ดูบทความ
                    </Link>
                  </div>

                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}