"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function NewThreadPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // State เก็บข้อมูลฟอร์ม
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  // กำหนดค่าเริ่มต้นให้ตรงกับ Enum ใน Database
  const [room, setRoom] = useState("พูดคุยทั่วไป"); 
  const [isLoading, setIsLoading] = useState(false);

  // ถ้ายังโหลดข้อมูล Session ไม่เสร็จ ให้โชว์หน้าว่างๆ ไปก่อน
  if (status === "loading") {
    return <div className="min-h-screen flex items-center justify-center bg-zinc-50">กำลังโหลด...</div>;
  }

  // ถ้าไม่ได้ล็อกอิน ให้เตะกลับไปหน้า Login
  if (status === "unauthenticated") {
    toast.error("กรุณาเข้าสู่ระบบก่อนตั้งกระทู้ครับ", { id: "login-required" });
    router.push("/login");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // ⭐ หัวใจสำคัญ: ส่ง room พ่วงไปด้วย! ⭐
        body: JSON.stringify({ title, content, room }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "เกิดข้อผิดพลาดในการตั้งกระทู้");
      }

      toast.success("ตั้งกระทู้สำเร็จ!");
      router.push("/board"); // กลับไปหน้าเว็บบอร์ดรวม (เดี๋ยวเราจะสร้างหน้านี้กัน)
      router.refresh();
      
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        
        {/* ปุ่มกลับ */}
        <div className="mb-6">
          <Link href="/board" className="text-zinc-500 hover:text-zinc-900 font-medium text-sm flex items-center gap-2 transition">
            <span>←</span> กลับไปหน้าเว็บบอร์ด
          </Link>
        </div>

        {/* กล่องฟอร์มตั้งกระทู้ */}
        <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-zinc-100">
          <h1 className="text-2xl md:text-3xl font-black text-zinc-900 mb-2">สร้างกระทู้ใหม่</h1>
          <p className="text-zinc-500 text-sm mb-8">แบ่งปันเรื่องราว หรือสอบถามข้อสงสัยกับเพื่อนสมาชิก</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* เลือกหมวดหมู่ห้อง */}
            <div>
              <label className="block text-sm font-bold text-zinc-900 mb-2">หมวดหมู่ห้อง</label>
              <select 
                value={room} 
                onChange={(e) => setRoom(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
              >
                <option value="พูดคุยทั่วไป">พูดคุยทั่วไป (General)</option>
                <option value="ไอที & เน็ตเวิร์ก">ไอที & เน็ตเวิร์ก (IT & Network)</option>
                <option value="เขียนโปรแกรม">เขียนโปรแกรม (Programming)</option>
                <option value="รีวิวสินค้า">รีวิวสินค้า (Reviews)</option>
              </select>
            </div>

            {/* หัวข้อกระทู้ */}
            <div>
              <label className="block text-sm font-bold text-zinc-900 mb-2">หัวข้อกระทู้</label>
              <input 
                type="text" 
                required 
                placeholder="ระบุหัวข้อกระทู้ของคุณ (สูงสุด 100 ตัวอักษร)" 
                maxLength={100}
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
              />
            </div>

            {/* เนื้อหากระทู้ */}
            <div>
              <label className="block text-sm font-bold text-zinc-900 mb-2">รายละเอียดเนื้อหา</label>
              <textarea 
                required 
                rows={8}
                placeholder="พิมพ์เนื้อหาที่ต้องการแบ่งปันที่นี่..." 
                value={content} 
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-zinc-900 outline-none transition-all resize-y"
              />
            </div>

            {/* ปุ่ม Submit */}
            <div className="pt-4 flex justify-end">
              <button 
                type="submit" 
                disabled={isLoading}
                className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold py-3 px-8 rounded-xl transition-all active:scale-[0.98] disabled:opacity-70 shadow-lg shadow-zinc-900/10"
              >
                {isLoading ? "กำลังโพสต์..." : "ตั้งกระทู้ใหม่"}
              </button>
            </div>
            
          </form>
        </div>
      </div>
    </div>
  );
}