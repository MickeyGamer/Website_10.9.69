import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import DOMPurify from "isomorphic-dompurify";

import { connectDB } from "@/lib/mongodb";
import { Article } from "@/models/Article";
import ShareArticle from "@/components/articles/ShareArticle";

type ArticlePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;

  await connectDB();

  const article = await Article.findOne({
    slug,
    status: "PUBLISHED",
  })
    .select("title excerpt coverImage")
    .lean();

  if (!article) {
    return {
      title: "ไม่พบบทความ",
    };
  }

  return {
    title: article.title,
    description:
      article.excerpt ||
      `อ่านบทความ ${article.title} ได้ที่ MickeyHub`,
  };
}

export default async function ArticleDetailPage({
  params,
}: ArticlePageProps) {
  const { slug } = await params;

  await connectDB();

  const article = await Article.findOne({
    slug,
    status: "PUBLISHED",
  })
    .populate("author", "name")
    .lean();

  if (!article) {
    notFound();
  }

  const author =
    typeof article.author === "object" && article.author
      ? (article.author as { name?: string })
      : null;

  const publishedDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : new Date(article.createdAt).toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

  // ป้องกัน XSS
  // เนื้อหาจาก Editor เป็น HTML จึงต้อง sanitize
  // ก่อนนำไปแสดงด้วย dangerouslySetInnerHTML
  const safeContent = DOMPurify.sanitize(article.content || "");

  return (
    <main className="min-h-screen bg-gray-50">
      <article className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">

        {/* กลับหน้าบทความ */}
        <div className="mb-6">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition hover:text-blue-600"
          >
            ← กลับไปหน้าบทความ
          </Link>
        </div>

        {/* Header */}
        <header className="mb-8">

          {/* Category */}
          {article.category && (
            <div className="mb-3">
              <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                {article.category}
              </span>
            </div>
          )}

          {/* Title */}
          <h1 className="text-3xl font-bold leading-tight text-gray-900 sm:text-4xl lg:text-5xl">
            {article.title}
          </h1>

          {/* Excerpt */}
          {article.excerpt && (
            <p className="mt-4 text-lg leading-8 text-gray-600">
              {article.excerpt}
            </p>
          )}

          {/* Author / Date */}
          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
            <span>
              ผู้เขียน:{" "}
              <span className="font-medium text-gray-700">
                {author?.name || "ไม่ระบุชื่อ"}
              </span>
            </span>

            <span aria-hidden>•</span>

            <time
              dateTime={String(
                article.publishedAt || article.createdAt
              )}
            >
              {publishedDate}
            </time>
          </div>
        </header>

        {/* Cover Image */}
        {article.coverImage && (
          <div className="relative mb-8 aspect-video overflow-hidden rounded-2xl bg-gray-200 shadow-sm">
            <Image
              src={article.coverImage}
              alt={article.title}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 896px"
            />
          </div>
        )}

        {/* Share */}
        <div className="mb-8 flex justify-end">
          <ShareArticle
            title={article.title}
            slug={article.slug}
          />
        </div>

        {/* Article Content */}
        <div
          className="
            prose
            prose-lg
            max-w-none
            prose-headings:font-bold
            prose-headings:text-gray-900
            prose-p:text-gray-700
            prose-p:leading-8
            prose-a:text-blue-600
            prose-a:no-underline
            hover:prose-a:underline
            prose-img:mx-auto
            prose-img:rounded-xl
            prose-strong:text-gray-900
            prose-li:text-gray-700
          "
          dangerouslySetInnerHTML={{
            __html: safeContent,
          }}
        />

        {/* Bottom */}
        <div className="mt-12 border-t border-gray-200 pt-8">
          <Link
            href="/blog"
            className="inline-flex rounded-lg bg-gray-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-700"
          >
            ← ดูบทความทั้งหมด
          </Link>
        </div>

      </article>
    </main>
  );
}