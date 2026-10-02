"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Editor from "@/components/Editor";
import ImageUpload from "@/components/ImageUpload";
import toast from "react-hot-toast";
import Link from "next/link";

interface FormData {
  title: string;
  excerpt: string;
  coverImage: string;
  category: string;
  status: "DRAFT" | "PUBLISHED";
  content: string;
}

interface ErrorResponse {
  error?: string;
}

export default function NewPostPage() {
  const router = useRouter();

  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    title: "",
    excerpt: "",
    coverImage: "",
    category: "",
    status: "DRAFT",
    content: "",
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("กรุณากรอกหัวข้อบทความ");
      return;
    }

    if (!formData.content.trim()) {
      toast.error("กรุณากรอกเนื้อหาบทความ");
      return;
    }

    setSaving(true);

    const loadingToast = toast.loading("กำลังสร้างบทความ...");

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success("สร้างบทความสำเร็จ!", {
          id: loadingToast,
        });

        router.push("/admin/posts");
        router.refresh();

        return;
      }

      const errorData = (await res.json()) as ErrorResponse;

      toast.error(
        errorData.error || "เกิดข้อผิดพลาดในการบันทึก",
        {
          id: loadingToast,
        }
      );
    } catch (error) {
      console.error("Create post error:", error);

      toast.error("ระบบขัดข้อง กรุณาลองใหม่", {
        id: loadingToast,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">
            เขียนบทความใหม่
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            สร้างสรรค์เนื้อหาและแบ่งปันเรื่องราวของคุณ
          </p>
        </div>

        <Link
          href="/admin/posts"
          className="rounded-xl bg-gray-50 px-4 py-2 font-medium text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
        >
          ยกเลิก
        </Link>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-8 rounded-3xl border border-gray-100 bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] md:p-10"
      >
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              หัวข้อบทความ
            </label>

            <input
              required
              type="text"
              placeholder="ตั้งชื่อบทความให้น่าสนใจ..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm outline-none transition-all focus:border-transparent focus:bg-white focus:ring-2 focus:ring-zinc-900"
              value={formData.title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({
                  ...formData,
                  title: e.target.value,
                })
              }
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              ภาพปกบทความ
            </label>

            <ImageUpload
              value={formData.coverImage}
              onChange={(url) =>
                setFormData({
                  ...formData,
                  coverImage: url,
                })
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              สถานะ
            </label>

            <select
              className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm outline-none transition-all focus:border-transparent focus:bg-white focus:ring-2 focus:ring-zinc-900"
              value={formData.status}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setFormData({
                  ...formData,
                  status: e.target.value as "DRAFT" | "PUBLISHED",
                })
              }
            >
              <option value="DRAFT">ฉบับร่าง (Draft)</option>
              <option value="PUBLISHED">เผยแพร่ (Published)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              คำโปรย (Excerpt)
            </label>

            <input
              type="text"
              placeholder="สรุปเนื้อหาสั้นๆ 1-2 ประโยค..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm outline-none transition-all focus:border-transparent focus:bg-white focus:ring-2 focus:ring-zinc-900"
              value={formData.excerpt}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({
                  ...formData,
                  excerpt: e.target.value,
                })
              }
            />
          </div>
        </div>

        <div className="space-y-3 border-t border-gray-100 pt-4">
          <label className="block text-sm font-semibold text-gray-700">
            เนื้อหาบทความ
          </label>

          <Editor
            value={formData.content}
            onChange={(val) =>
              setFormData({
                ...formData,
                content: val,
              })
            }
          />
        </div>

        <div className="flex justify-end pt-6">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-zinc-950 px-8 py-3.5 font-medium text-white shadow-lg shadow-zinc-900/20 transition-all hover:bg-zinc-800 active:scale-[0.98] disabled:opacity-70"
          >
            {saving ? "กำลังบันทึก..." : "สร้างบทความ"}
          </button>
        </div>
      </form>
    </div>
  );
}