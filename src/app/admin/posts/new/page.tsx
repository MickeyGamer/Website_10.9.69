"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Editor from "@/components/Editor";
import ImageUpload from "@/components/ImageUpload";
import toast from "react-hot-toast";
import Link from "next/link";

export default function NewPostPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "", excerpt: "", coverImage: "", category: "", status: "DRAFT", content: ""
  });

  useEffect(() => {
    fetch("/api/categories")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCategories(data);
      })
      .catch(() => toast.error("โหลดข้อมูลหมวดหมู่ล้มเหลว"));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const loadingToast = toast.loading("กำลังสร้างบทความ...");

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success("สร้างบทความสำเร็จ!", { id: loadingToast });
        router.push("/admin/posts");
        router.refresh();
      } else {
        // เติม : any ตรงนี้
        const errorData: any = await res.json();
        toast.error(errorData.error || "เกิดข้อผิดพลาดในการบันทึก", { id: loadingToast });
      }
    } catch (error) {
      toast.error("ระบบขัดข้อง กรุณาลองใหม่", { id: loadingToast });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">เขียนบทความใหม่</h1>
          <p className="text-sm text-gray-500 mt-2">สร้างสรรค์เนื้อหาและแบ่งปันเรื่องราวของคุณ</p>
        </div>
        <Link href="/admin/posts" className="text-gray-500 hover:text-gray-900 font-medium px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-xl transition">
          ยกเลิก
        </Link>
      </div>
      
      <form onSubmit={handleSubmit} className="bg-white p-8 md:p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">หัวข้อบทความ</label>
            <input 
              required type="text" 
              placeholder="ตั้งชื่อบทความให้น่าสนใจ..."
              className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all outline-none"
              value={formData.title}
              // เติม e: any ตรงนี้และจุดอื่นๆ
              onChange={(e: any) => setFormData({...formData, title: e.target.value})} 
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">ภาพปกบทความ</label>
            <ImageUpload 
              value={formData.coverImage} 
              onChange={(url) => setFormData({...formData, coverImage: url})} 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">สถานะ</label>
            <select 
              className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all outline-none appearance-none"
              value={formData.status}
              onChange={(e: any) => setFormData({...formData, status: e.target.value})}
            >
              <option value="DRAFT">ฉบับร่าง (Draft)</option>
              <option value="PUBLISHED">เผยแพร่ (Published)</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">คำโปรย (Excerpt)</label>
            <input 
              type="text" 
              placeholder="สรุปเนื้อหาสั้นๆ 1-2 ประโยค..."
              className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all outline-none"
              value={formData.excerpt}
              onChange={(e: any) => setFormData({...formData, excerpt: e.target.value})} 
            />
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-gray-100">
          <label className="block text-sm font-semibold text-gray-700">เนื้อหาบทความ</label>
          <Editor 
            value={formData.content} 
            onChange={val => setFormData({...formData, content: val})} 
          />
        </div>

        <div className="flex justify-end pt-6">
          <button 
            type="submit" 
            disabled={saving}
            className="bg-zinc-950 hover:bg-zinc-800 text-white px-8 py-3.5 rounded-xl font-medium transition-all active:scale-[0.98] disabled:opacity-70 shadow-lg shadow-zinc-900/20"
          >
            {saving ? "กำลังบันทึก..." : "สร้างบทความ"}
          </button>
        </div>
      </form>
    </div>
  );
}