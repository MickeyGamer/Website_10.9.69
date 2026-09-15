"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Editor from "@/components/Editor";
import toast from "react-hot-toast";
import Link from "next/link";

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: "", excerpt: "", coverImage: "", category: "", status: "DRAFT", content: ""
  });

  // ดึงข้อมูลหมวดหมู่และบทความเก่ามาแสดงพร้อมกัน
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [catRes, postRes] = await Promise.all([
          fetch("/api/categories"),
          fetch(`/api/posts/${postId}`)
        ]);
        
        const catData = await catRes.json();
        const postData = await postRes.json();

        if (Array.isArray(catData)) setCategories(catData);
        
        if (postData && !postData.error) {
          setFormData({
            title: postData.title || "",
            excerpt: postData.excerpt || "",
            coverImage: postData.coverImage || "",
            category: postData.category || "",
            status: postData.status || "DRAFT",
            content: postData.content || "",
          });
        } else {
          toast.error("ไม่พบบทความที่ต้องการแก้ไข");
          router.push("/admin/posts");
        }
      } catch (error) {
        toast.error("เกิดข้อผิดพลาดในการโหลดข้อมูล");
      } finally {
        setLoading(false);
      }
    };

    if (postId) fetchInitialData();
  }, [postId, router]);

  // ฟังก์ชันบันทึกการแก้ไข
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success("บันทึกการแก้ไขสำเร็จ!");
        router.push("/admin/posts");
        router.refresh();
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || "บันทึกล้มเหลว");
      }
    } catch (error) {
      toast.error("ระบบขัดข้อง กรุณาลองใหม่");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4 animate-pulse">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
        <p className="text-gray-400 font-medium tracking-wide">กำลังโหลดข้อมูลบทความ...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* ส่วนหัว */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-gray-900">แก้ไขบทความ</h1>
          <p className="text-sm text-gray-500 mt-2">ปรับปรุงเนื้อหาและข้อมูลรายละเอียด</p>
        </div>
        <Link 
          href="/admin/posts" 
          className="text-gray-500 hover:text-gray-900 font-medium px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-xl transition"
        >
          ยกเลิก
        </Link>
      </div>
      
      {/* ฟอร์มแก้ไข */}
      <form onSubmit={handleSubmit} className="bg-white p-8 md:p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">หัวข้อบทความ</label>
            <input 
              required type="text" 
              placeholder="ตั้งชื่อบทความให้น่าสนใจ..."
              className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all outline-none"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})} 
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">URL ภาพปก</label>
            <input 
              type="text" 
              placeholder="https://example.com/image.jpg"
              className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all outline-none"
              value={formData.coverImage}
              onChange={e => setFormData({...formData, coverImage: e.target.value})} 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">สถานะ</label>
            <select 
              className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all outline-none appearance-none"
              value={formData.status}
              onChange={e => setFormData({...formData, status: e.target.value})}
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
              onChange={e => setFormData({...formData, excerpt: e.target.value})} 
            />
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-gray-100">
          <label className="block text-sm font-semibold text-gray-700">เนื้อหาบทความ</label>
          {/* Tiptap Editor ของเรา */}
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
            {saving ? "กำลังบันทึก..." : "อัปเดตบทความ"}
          </button>
        </div>
      </form>
    </div>
  );
}