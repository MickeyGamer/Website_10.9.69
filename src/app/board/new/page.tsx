"use client";

import { useSession } from "next-auth/react"; // ใช้ useSession สำหรับฝั่ง Client
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Editor from "@/components/Editor";
import toast from "react-hot-toast";
import Link from "next/link";

export default function NewThreadPage() {
  const { status } = useSession(); // ดึงสถานะการล็อกอิน
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  
  // เพิ่ม room ลงไปใน State (ตั้งค่าเริ่มต้นเป็น "พูดคุยทั่วไป")
  const [formData, setFormData] = useState({ title: "", content: "", room: "พูดคุยทั่วไป" });

  // ถ้ายังไม่ได้ล็อกอิน ให้เด้งกลับไปหน้า login
  useEffect(() => {
    // เพิ่มเงื่อนไขว่า ให้แจ้งเตือนแค่ครั้งเดียว ตอนที่สถานะเปลี่ยนเป็น unauthenticated จริงๆ เท่านั้น
    if (status === "unauthenticated") {
      // ใช้ toast.dismiss() ล้างของเก่าออกก่อน แล้วค่อยโชว์อันใหม่ ป้องกันการเด้งซ้ำ
      toast.dismiss();
      toast.error("กรุณาเข้าสู่ระบบก่อนตั้งกระทู้ครับ", {
        id: 'login-required', // กำหนด ID ให้ Toast เพื่อให้มันไม่สร้างใหม่ถ้ามี ID นี้โชว์อยู่แล้ว
      });
      router.push("/login");
    }
  }, [status, router]);

  // ซ่อนหน้าจอระหว่างรอเช็กสถานะ เพื่อไม่ให้คนยังไม่ล็อกอินแอบเห็นฟอร์ม
  if (status === "loading" || status === "unauthenticated") {
    return <div className="min-h-screen flex items-center justify-center text-zinc-500 font-medium">กำลังตรวจสอบสิทธิ์...</div>;
  }

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

      const data: any = await res.json();

      if (res.ok) {
        toast.success("ตั้งกระทู้สำเร็จ!", { id: toastId });
        router.push(`/board/${data._id}`); 
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
        
        {/* Dropdown เลือกห้องแบบพันทิป */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-zinc-700">เลือกห้อง (หมวดหมู่)</label>
          <select 
            value={formData.room}
            onChange={(e: any) => setFormData({...formData, room: e.target.value})}
            className="w-full px-4 py-4 bg-zinc-50/50 border border-zinc-200 rounded-2xl text-lg font-medium focus:bg-white focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all outline-none cursor-pointer appearance-none"
            style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 1rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em` }}
          >
            <option value="พูดคุยทั่วไป">💬 พูดคุยทั่วไป</option>
            <option value="ไอที & เน็ตเวิร์ก">💻 ไอที & เน็ตเวิร์ก</option>
            <option value="เขียนโปรแกรม">👨‍💻 เขียนโปรแกรม</option>
            <option value="รีวิวสินค้า">🛍️ รีวิวสินค้า</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-bold text-zinc-700">หัวข้อกระทู้</label>
          <input 
            required type="text" 
            placeholder="ตั้งหัวข้อกระทู้ให้น่าสนใจ..."
            className="w-full px-4 py-4 bg-zinc-50/50 border border-zinc-200 rounded-2xl text-lg font-medium focus:bg-white focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all outline-none"
            value={formData.title}
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