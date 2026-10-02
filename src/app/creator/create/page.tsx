"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function CreateArticlePage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");

  const [loading, setLoading] = useState(false);

  function generateSlug(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\wก-๙-]/g, "");
  }

  function handleTitleChange(
    value: string
  ) {
    setTitle(value);

    if (!slug) {
      setSlug(generateSlug(value));
    }
  }

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (loading) return;

    if (!title.trim()) {
      toast.error("กรุณาใส่ชื่อบทความ");
      return;
    }

    if (!content.trim()) {
      toast.error("กรุณาใส่เนื้อหาบทความ");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "/api/articles",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: title.trim(),
            slug: slug.trim(),
            excerpt: excerpt.trim(),
            content,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "สร้างบทความไม่สำเร็จ"
        );
      }

      toast.success(
        "สร้างบทความสำเร็จ!"
      );

      router.push(
        "/creator/articles"
      );

      router.refresh();
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "เกิดข้อผิดพลาด"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-4xl">

        {/* Header */}
        <div className="mb-8">
          <Link
            href="/creator/articles"
            className="text-sm font-semibold text-gray-500 hover:text-gray-900"
          >
            ← กลับไปบทความของฉัน
          </Link>

          <h1 className="mt-4 text-3xl font-black text-gray-900">
            สร้างบทความ
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            สร้างบทความใหม่สำหรับเผยแพร่บนเว็บไซต์
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* Title */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6">
            <label className="mb-2 block text-sm font-bold text-gray-800">
              ชื่อบทความ
            </label>

            <input
              type="text"
              value={title}
              onChange={(e) =>
                handleTitleChange(
                  e.target.value
                )
              }
              placeholder="เช่น วิธีสร้างเว็บไซต์ด้วย Next.js"
              disabled={loading}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:border-zinc-900 focus:bg-white"
            />
          </section>

          {/* Slug */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6">
            <label className="mb-2 block text-sm font-bold text-gray-800">
              Slug
            </label>

            <input
              type="text"
              value={slug}
              onChange={(e) =>
                setSlug(e.target.value)
              }
              placeholder="nextjs-website"
              disabled={loading}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:border-zinc-900 focus:bg-white"
            />

            <p className="mt-2 text-xs text-gray-400">
              ใช้สำหรับ URL ของบทความ
            </p>
          </section>

          {/* Excerpt */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6">
            <label className="mb-2 block text-sm font-bold text-gray-800">
              คำอธิบายสั้น ๆ
            </label>

            <textarea
              value={excerpt}
              onChange={(e) =>
                setExcerpt(
                  e.target.value
                )
              }
              rows={3}
              placeholder="สรุปเนื้อหาบทความสั้น ๆ"
              disabled={loading}
              className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:border-zinc-900 focus:bg-white"
            />
          </section>

          {/* Content */}
          <section className="rounded-2xl border border-gray-200 bg-white p-6">
            <label className="mb-2 block text-sm font-bold text-gray-800">
              เนื้อหา
            </label>

            <textarea
              value={content}
              onChange={(e) =>
                setContent(
                  e.target.value
                )
              }
              rows={16}
              placeholder="เขียนเนื้อหาบทความ..."
              disabled={loading}
              className="w-full resize-y rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 outline-none focus:border-zinc-900 focus:bg-white"
            />
          </section>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Link
              href="/creator/articles"
              className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50"
            >
              ยกเลิก
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-zinc-950 px-6 py-3 text-sm font-bold text-white hover:bg-blue-600 disabled:opacity-50"
            >
              {loading
                ? "กำลังสร้าง..."
                : "สร้างบทความ"}
            </button>
          </div>

        </form>
      </div>
    </main>
  );
}