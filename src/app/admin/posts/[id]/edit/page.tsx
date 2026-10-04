"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("DRAFT");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/posts/${id}`);
        if (!res.ok) throw new Error("ดึงข้อมูลไม่สำเร็จ");
        const data = await res.json();
        
        setTitle(data.title || "");
        setContent(data.content || "");
        setCategory(data.category?._id || data.category || ""); 
        setStatus(data.status || "DRAFT");
      } catch (error) {
        alert("ไม่พบข้อมูลบทความนี้");
      } finally {
        setIsLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, category, status }),
      });
      if (!res.ok) throw new Error("บันทึกไม่สำเร็จ");
      alert("อัปเดตบทความเรียบร้อยแล้ว!");
      router.push("/admin/posts"); 
      router.refresh();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">กำลังโหลด...</div>;

  return (
    <div className="min-h-screen bg-zinc-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link href="/admin/posts" className="text-zinc-500 hover:text-zinc-900 font-medium text-sm flex items-center gap-2 mb-6">
          <span>←</span> กลับหน้ารายการบทความ
        </Link>

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-zinc-100">
          <h1 className="text-2xl font-black mb-6">แก้ไขบทความ</h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold mb-2">หัวข้อบทความ</label>
              <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-3 bg-zinc-50 border rounded-xl" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">รหัสหมวดหมู่ (Category ID)</label>
              <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="ปล่อยว่างไว้ได้" className="w-full px-4 py-3 bg-zinc-50 border rounded-xl" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">เนื้อหาบทความ</label>
              <textarea required rows={10} value={content} onChange={(e) => setContent(e.target.value)} className="w-full px-4 py-3 bg-zinc-50 border rounded-xl resize-y" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">สถานะบทความ</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full px-4 py-3 bg-zinc-50 border rounded-xl">
                <option value="DRAFT">แบบร่าง (Draft)</option>
                <option value="PUBLISHED">เผยแพร่ (Published)</option>
                <option value="ARCHIVED">เก็บถาวร (Archived)</option>
              </select>
            </div>
            <div className="pt-4 flex justify-end">
              <button type="submit" disabled={isSaving} className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold py-3 px-8 rounded-xl disabled:opacity-70">
                {isSaving ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}