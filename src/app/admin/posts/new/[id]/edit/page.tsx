"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Editor from "@/components/Editor";
import toast from "react-hot-toast";
import Link from "next/link";

interface PostResponse {
  title?: string;
  excerpt?: string;
  coverImage?: string;
  category?: string;
  status?: "DRAFT" | "PUBLISHED";
  content?: string;
  error?: string;
}

interface ErrorResponse {
  error?: string;
}

interface FormData {
  title: string;
  excerpt: string;
  coverImage: string;
  category: string;
  status: "DRAFT" | "PUBLISHED";
  content: string;
}

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const postId = params.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    title: "",
    excerpt: "",
    coverImage: "",
    category: "",
    status: "DRAFT",
    content: "",
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const postRes = await fetch(`/api/posts/${postId}`);

        if (!postRes.ok) {
          throw new Error("โหลดข้อมูลบทความไม่สำเร็จ");
        }

        const postData = (await postRes.json()) as PostResponse;

        if (postData && !postData.error) {
          setFormData({
            title: postData.title ?? "",
            excerpt: postData.excerpt ?? "",
            coverImage: postData.coverImage ?? "",
            category: postData.category ?? "",
            status: postData.status ?? "DRAFT",
            content: postData.content ?? "",
          });
        } else {
          toast.error("ไม่พบบทความที่ต้องการแก้ไข");
          router.push("/admin/posts");
        }
      } catch (error) {
        console.error("Load edit post error:", error);
        toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchInitialData();
    }
  }, [postId, router]);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
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

    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success("บันทึกการแก้ไขสำเร็จ!");
        router.push("/admin/posts");
        router.refresh();
        return;
      }

      const errorData = (await res.json()) as ErrorResponse;

      toast.error(
        errorData.error || "บันทึกล้มเหลว"
      );
    } catch (error) {
      console.error("Update post error:", error);
      toast.error("ระบบขัดข้อง กรุณาลองใหม่");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-32 animate-pulse">
        <div className="h-8 w-8 rounded-full border-4 border-gray-200 border-t-gray-900 animate-spin" />

        <p className="font-medium tracking-wide text-gray-400">
          กำลังโหลดข้อมูลบทความ...
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">
            แก้ไขบทความ
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            ปรับปรุงเนื้อหาและข้อมูลรายละเอียด
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
        {/* หัวข้อ + ภาพปก */}
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
              onChange={(
                e: React.ChangeEvent<HTMLInputElement>
              ) =>
                setFormData({
                  ...formData,
                  title: e.target.value,
                })
              }
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              URL ภาพปก
            </label>

            <input
              type="text"
              placeholder="https://example.com/image.jpg"
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm outline-none transition-all focus:border-transparent focus:bg-white focus:ring-2 focus:ring-zinc-900"
              value={formData.coverImage}
              onChange={(
                e: React.ChangeEvent<HTMLInputElement>
              ) =>
                setFormData({
                  ...formData,
                  coverImage: e.target.value,
                })
              }
            />
          </div>
        </div>

        {/* สถานะ + คำโปรย */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              สถานะ
            </label>

            <select
              className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm outline-none transition-all focus:border-transparent focus:bg-white focus:ring-2 focus:ring-zinc-900"
              value={formData.status}
              onChange={(
                e: React.ChangeEvent<HTMLSelectElement>
              ) =>
                setFormData({
                  ...formData,
                  status: e.target.value as
                    | "DRAFT"
                    | "PUBLISHED",
                })
              }
            >
              <option value="DRAFT">
                ฉบับร่าง (Draft)
              </option>

              <option value="PUBLISHED">
                เผยแพร่ (Published)
              </option>
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
              onChange={(
                e: React.ChangeEvent<HTMLInputElement>
              ) =>
                setFormData({
                  ...formData,
                  excerpt: e.target.value,
                })
              }
            />
          </div>
        </div>

        {/* เนื้อหาบทความ */}
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

        {/* ปุ่มบันทึก */}
        <div className="flex justify-end pt-6">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-zinc-950 px-8 py-3.5 font-medium text-white shadow-lg shadow-zinc-900/20 transition-all hover:bg-zinc-800 active:scale-[0.98] disabled:opacity-70"
          >
            {saving
              ? "กำลังบันทึก..."
              : "อัปเดตบทความ"}
          </button>
        </div>
      </form>
    </div>
  );
}