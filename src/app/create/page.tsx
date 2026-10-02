"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

export default function CreateArticlePage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!title.trim()) {
      toast.error("กรุณาใส่ชื่อบทความ");
      return;
    }

    if (!content.trim()) {
      toast.error("กรุณาใส่เนื้อหาบทความ");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        "/api/articles",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: title.trim(),
            excerpt: excerpt.trim(),
            category: category.trim(),
            content,
            coverImage: coverImage.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "ไม่สามารถสร้างบทความได้"
        );
      }

      toast.success("สร้างบทความเรียบร้อย");

      router.push("/creator/articles");
      router.refresh();
    } catch (error) {
      console.error(
        "Create article error:",
        error
      );

      toast.error(
        error instanceof Error
          ? error.message
          : "เกิดข้อผิดพลาด"
      );
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading") {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="py-20 text-center">
          กำลังตรวจสอบบัญชี...
        </div>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-md py-20 text-center">
          <h1 className="text-2xl font-black">
            กรุณาเข้าสู่ระบบ
          </h1>

          <Link
            href="/login"
            className="mt-6 inline-block rounded-xl bg-gray-900 px-6 py-3 font-semibold text-white"
          >
            เข้าสู่ระบบ
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-4xl">

        <Link
          href="/creator/articles"
          className="text-sm font-semibold text-gray-500 hover:text-gray-900"
        >
          ← กลับไปบทความของฉัน
        </Link>

        <div className="mt-6 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-3xl font-black text-gray-900">
            สร้างบทความใหม่
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            สร้างบทความสำหรับ MickeyHub
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-6"
          >
            {/* Title */}
            <div>
              <label className="mb-2 block font-semibold">
                ชื่อบทความ
              </label>

              <input
                type="text"
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                placeholder="ใส่ชื่อบทความ..."
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-gray-900/10"
              />
            </div>

            {/* Excerpt */}
            <div>
              <label className="mb-2 block font-semibold">
                คำโปรย
              </label>

              <textarea
                value={excerpt}
                onChange={(event) =>
                  setExcerpt(event.target.value)
                }
                rows={3}
                placeholder="คำอธิบายสั้น ๆ ของบทความ..."
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-gray-900/10"
              />
            </div>

            {/* Category */}
            <div>
              <label className="mb-2 block font-semibold">
                หมวดหมู่
              </label>

              <input
                type="text"
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value)
                }
                placeholder="เช่น Technology"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-gray-900/10"
              />
            </div>

            {/* Cover */}
            <div>
              <label className="mb-2 block font-semibold">
                รูปปก
              </label>

              <input
                type="text"
                value={coverImage}
                onChange={(event) =>
                  setCoverImage(event.target.value)
                }
                placeholder="URL รูปภาพปก"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-gray-900/10"
              />
            </div>

            {/* Content */}
            <div>
              <label className="mb-2 block font-semibold">
                เนื้อหา
              </label>

              <textarea
                value={content}
                onChange={(event) =>
                  setContent(event.target.value)
                }
                rows={18}
                placeholder="เขียนเนื้อหาบทความ..."
                className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:ring-2 focus:ring-gray-900/10"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Link
                href="/creator/articles"
                className="rounded-xl border border-gray-200 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50"
              >
                ยกเลิก
              </Link>

              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-gray-900 px-6 py-3 font-semibold text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "กำลังบันทึก..."
                  : "สร้างบทความ"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}