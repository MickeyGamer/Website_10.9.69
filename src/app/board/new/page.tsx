"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Editor from "@/components/Editor";
import toast from "react-hot-toast";
import Link from "next/link";

export default function NewThreadPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ title: "", content: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      return toast.error("กรุณากรอกหัวข้อและเนื้อหาให้ครบถ้วน");
    }

    setSaving(true);
    const toastId = toast.loading("กำลังตั้งกระทู้...");

    try {
      const res = await fetch("/api/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      // เติม : any ตรงนี้
      const data: any = await res.json();

      if (res.ok) {
        toast.success("ตั้งกระทู้สำเร็จ!", { id: toastId });
        router.push(`/board/${data._id}`); // เด้งไปหน้ากระทู้ที่เพิ่งตั้ง
        router.refresh();
      } else {
        toast.error(data.error || "เกิดข้อผิดพลาด", { id: toastId });
      }
    } catch {
      toast.error("ระบบขัดข้อง กรุณาลองใหม่", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-900">ตั้งกระทู้ใหม่</h1>
          <p className="text-sm text-zinc-500 mt-2">พูดคุย สอบถาม หรือแบ่งปันเรื่องราวกับคอมมูนิตี้</p>
        </div>
        <Link href="/board" className="text-zinc-500 hover:text-zinc-900 font-medium px-4 py-2 bg-zinc-50 hover:bg-zinc-100 rounded-xl transition">
          ยกเลิก
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-100 space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-bold text-zinc-700">หัวข้อกระทู้</label>
          <input 
            required type="text" 
            placeholder="ตั้งหัวข้อกระทู้ให้น่าสนใจ..."
            className="w-full px-4 py-4 bg-zinc-50/50 border border-zinc-200 rounded-2xl text-lg font-medium focus:bg-white focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all outline-none"
            value={formData.title}
            // เติม e: any ตรงนี้
            onChange={(e: any) => setFormData({...formData, title: e.target.value})} 
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-bold text-zinc-700">รายละเอียดเนื้อหา</label>
          <Editor 
            value={formData.content} 
            onChange={val => setFormData({...formData, content: val})} 
          />
        </div>

        <div className="flex justify-end pt-4">
          <button 
            type="submit" disabled={saving}
            className="bg-zinc-950 hover:bg-zinc-800 text-white px-10 py-4 rounded-xl font-bold transition-all active:scale-[0.98] disabled:opacity-70 shadow-lg shadow-zinc-900/20"
          >
            {saving ? "กำลังดำเนินการ..." : "ตั้งกระทู้"}
          </button>
        </div>
      </form>
    </div>
  );
}