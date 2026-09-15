"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Editor from "@/components/Editor";

export default function NewPostPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: "", excerpt: "", coverImage: "", category: "", status: "DRAFT", content: ""
  });

  // โหลดหมวดหมู่มาใส่ Dropdown (ถ้ายังไม่มีมันจะว่างไว้)
  useEffect(() => {
    fetch("/api/categories").then(res => res.json()).then(setCategories);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      alert("บันทึกบทความสำเร็จ!");
      router.push("/admin/posts"); // กลับไปหน้ารายการบทความ
    } else {
      alert("เกิดข้อผิดพลาดในการบันทึก");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">เขียนบทความใหม่</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="font-medium text-sm">หัวข้อบทความ</label>
            <input required type="text" className="w-full border p-2 rounded-lg" 
              onChange={e => setFormData({...formData, title: e.target.value})} />
          </div>
          <div className="space-y-2">
            <label className="font-medium text-sm">URL ภาพปก (ใส่ลิงก์รูป)</label>
            <input type="text" className="w-full border p-2 rounded-lg" 
              onChange={e => setFormData({...formData, coverImage: e.target.value})} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="font-medium text-sm">สถานะ</label>
            <select className="w-full border p-2 rounded-lg" 
              onChange={e => setFormData({...formData, status: e.target.value})}>
              <option value="DRAFT">ฉบับร่าง (Draft)</option>
              <option value="PUBLISHED">เผยแพร่ (Published)</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="font-medium text-sm">คำโปรย (Excerpt)</label>
            <input type="text" className="w-full border p-2 rounded-lg" 
              onChange={e => setFormData({...formData, excerpt: e.target.value})} />
          </div>
        </div>

        <div className="space-y-2 border-t pt-6">
          <label className="font-medium text-sm">เนื้อหาบทความ</label>
          <Editor value={formData.content} onChange={val => setFormData({...formData, content: val})} />
        </div>

        <div className="flex justify-end pt-4">
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium">
            บันทึกบทความ
          </button>
        </div>
      </form>
    </div>
  );
}