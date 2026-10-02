import Image from "next/image";
import Link from "next/link";

import { connectDB } from "@/lib/mongodb";
import { Article } from "@/models/Article";

export const revalidate = 60;

type Author = {
  name?: string;
};

type BlogArticle = {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  coverImage?: string;
  category?: string;
  author?: Author | null;
  createdAt: Date | string;
};

export default async function BlogPage() {
  await connectDB();

  const articles = await Article.find({
    status: "PUBLISHED",
  })
    .populate("author", "name")
    .sort({ createdAt: -1 })
    .lean();

  const blogArticles: BlogArticle[] = articles.map((article) => ({
    _id: article._id.toString(),
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt ?? "",
    coverImage: article.coverImage ?? "",
    category: article.category ?? "",
    author:
      article.author &&
      typeof article.author === "object" &&
      "name" in article.author
        ? {
            name: String(
              (article.author as { name?: string }).name ?? ""
            ),
          }
        : null,
    createdAt: article.createdAt,
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-600">
              MickeyHub Blog
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl">
              บทความทั้งหมด
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-gray-500 md:text-lg">
              อัปเดตความรู้ เทคนิคใหม่ ๆ และเรื่องราวที่น่าสนใจ
              ที่เราคัดสรรมาเพื่อคุณ
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <main className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        {blogArticles.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-200 bg-white px-6 py-20 text-center shadow-sm">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-2xl">
              📝
            </div>

            <h2 className="text-xl font-bold text-gray-900">
              ยังไม่มีบทความ
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              ตอนนี้ยังไม่มีบทความที่เผยแพร่
              แวะกลับมาใหม่อีกครั้งนะครับ 🚀
            </p>
          </div>
        ) : (
          <>
            {/* จำนวนบทความ */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  บทความทั้งหมด
                </p>

                <h2 className="mt-1 text-2xl font-bold text-gray-900">
                  {blogArticles.length} บทความ
                </h2>
              </div>
            </div>

            {/* Article Grid */}
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {blogArticles.map((article) => (
                <Link
                  key={article._id}
                  href={`/blog/${article.slug}`}
                  className="
                    group
                    flex
                    h-full
                    flex-col
                    overflow-hidden
                    rounded-3xl
                    border
                    border-gray-100
                    bg-white
                    shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)]
                    transition-all
                    duration-300
                    hover:-translate-y-1.5
                    hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]
                  "
                >
                  {/* Cover */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                    {article.coverImage ? (
                      <Image
                        src={article.coverImage}
                        alt={article.title}
                        fill
                        sizes="
                          (max-width: 768px) 100vw,
                          (max-width: 1024px) 50vw,
                          33vw
                        "
                        className="
                          object-cover
                          transition-transform
                          duration-700
                          ease-in-out
                          group-hover:scale-105
                        "
                      />
                    ) : (
                      <div
                        className="
                          absolute
                          inset-0
                          bg-gradient-to-br
                          from-blue-100
                          via-indigo-50
                          to-white
                          transition-transform
                          duration-700
                          group-hover:scale-105
                        "
                      >
                        <div className="flex h-full items-center justify-center">
                          <span className="text-5xl opacity-40">
                            📝
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Category */}
                    {article.category && (
                      <div className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1.5 text-xs font-bold text-blue-600 shadow-sm backdrop-blur-sm">
                        {article.category}
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="flex flex-1 flex-col p-6 md:p-7">
                    <h2 className="mb-3 line-clamp-2 text-xl font-bold leading-snug text-gray-900 transition-colors duration-200 group-hover:text-blue-600">
                      {article.title}
                    </h2>

                    <p className="mb-6 line-clamp-3 text-sm leading-relaxed text-gray-500">
                      {article.excerpt ||
                        "คลิกเพื่ออ่านเนื้อหาฉบับเต็ม..."}
                    </p>

                    {/* Bottom */}
                    <div className="mt-auto border-t border-gray-100 pt-5">
                      <div className="flex items-center justify-between gap-4">
                        {/* Author + Date */}
                        <div className="min-w-0">
                          <p className="truncate text-xs font-medium text-gray-700">
                            {article.author?.name || "MickeyHub"}
                          </p>

                          <time
                            dateTime={new Date(
                              article.createdAt
                            ).toISOString()}
                            className="mt-1 block text-xs text-gray-400"
                          >
                            {new Date(
                              article.createdAt
                            ).toLocaleDateString("th-TH", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </time>
                        </div>

                        {/* Read More */}
                        <span
                          className="
                            flex
                            shrink-0
                            items-center
                            text-sm
                            font-semibold
                            text-blue-600
                            transition-transform
                            duration-200
                            group-hover:translate-x-1
                          "
                        >
                          อ่านต่อ
                          <span className="ml-1">→</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}