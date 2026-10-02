"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface Article {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
}

export default function EditArticlePage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [article, setArticle] =
    useState<Article | null>(null);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  // =========================
  // โหลดบทความ
  // =========================

  useEffect(() => {
    async function loadArticle() {
      try {
        const response =
          await fetch(
            `/api/articles/${id}`,
            {
              cache: "no-store",
            }
          );

        const data =
          await response.json();

        if (!response.ok) {
          throw new Error(
            data.error ||
              "ไม่พบบทความ"
          );
        }

        const item =
          data.article || data;

        setArticle(item);

        setTitle(
          item.title || ""
        );

        setSlug(
          item.slug || ""
        );

        setExcerpt(
          item.excerpt || ""
        );

        setContent(
          item.content || ""
        );
      } catch (error) {
        console.error(error);

        toast.error(
          error instanceof Error
            ? error.message
            : "โหลดบทความไม่สำเร็จ"
        );
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadArticle();
    }
  }, [id]);

  // =========================
  // Save
  // =========================

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (saving) return;

    try {
      setSaving(true);

      const response =
        await fetch(
          `/api/articles/${id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type":
                "application/json",
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
            "บันทึกไม่สำเร็จ"
        );
      }

      toast.success(
        "บันทึกบทความสำเร็จ!"
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
      setSaving(false);
    }
  }

  // =========================
  // Loading
  // =========================

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-10">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl bg-white p-10 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-zinc-900" />

            <p className="mt-4 text-sm text-gray-500">
              กำลังโหลดบทความ...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!article) {
    return (
      <main className="min-h-screen bg-gray-50 px-4 py-10">
        <div className="mx-auto max-w-4xl rounded-2xl bg-white p-10 text-center">
          <h1 className="text-xl font-bold">
            ไม่พบบทความ
          </h1>

          <Link
            href="/creator/articles"
            className="mt-5 inline-block text-sm font-bold text-blue-600"
          >
            ← กลับไปบทความของฉัน
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-4xl">

        <div className="mb-8">
          <Link
            href="/creator/articles"
            className="text-sm font-semibold text-gray-500 hover:text-gray-900"
          >
            ← กลับไปบทความของฉัน
          </Link>

          <h1 className="mt-4 text-3xl font-black text-gray-900">
            แก้ไขบทความ
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          <section className="rounded-2xl bg-white p-6">
            <label className="mb-2 block text-sm font-bold">
              ชื่อบทความ
            </label>

            <input
              value={title}
              onChange={(e) =>
                setTitle(
                  e.target.value
                )
              }
              disabled={saving}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-zinc-900"
            />
          </section>

          <section className="rounded-2xl bg-white p-6">
            <label className="mb-2 block text-sm font-bold">
              Slug
            </label>

            <input
              value={slug}
              onChange={(e) =>
                setSlug(
                  e.target.value
                )
              }
              disabled={saving}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-zinc-900"
            />
          </section>

          <section className="rounded-2xl bg-white p-6">
            <label className="mb-2 block text-sm font-bold">
              คำอธิบาย
            </label>

            <textarea
              value={excerpt}
              onChange={(e) =>
                setExcerpt(
                  e.target.value
                )
              }
              rows={3}
              disabled={saving}
              className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-zinc-900"
            />
          </section>

          <section className="rounded-2xl bg-white p-6">
            <label className="mb-2 block text-sm font-bold">
              เนื้อหา
            </label>

            <textarea
              value={content}
              onChange={(e) =>
                setContent(
                  e.target.value
                )
              }
              rows={18}
              disabled={saving}
              className="w-full resize-y rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-zinc-900"
            />
          </section>

          <div className="flex justify-end gap-3">
            <Link
              href="/creator/articles"
              className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold"
            >
              ยกเลิก
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-zinc-950 px-6 py-3 text-sm font-bold text-white hover:bg-blue-600 disabled:opacity-50"
            >
              {saving
                ? "กำลังบันทึก..."
                : "บันทึกการแก้ไข"}
            </button>
          </div>

        </form>
      </div>
    </main>
  );
}