"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const router = useRouter();
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // เพิ่ม State สำหรับเก็บข้อความ Error แบบหน้า Login
  const [errorMsg, setErrorMsg] = useState("");
  
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(""); // ล้างข้อความ Error เก่าออกก่อน

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data: any = await res.json();

      // เช็คว่า API ตอบกลับมาว่าผ่าน (Status 200-299)
      if (res.ok) {
        setIsSuccess(true);
        toast.success("สมัครสมาชิกสำเร็จ!");
        setTimeout(() => router.push("/login"), 2000);
      } else {
        // ถ้าไม่ผ่าน (เช่น Error 400 อีเมลซ้ำ) ให้ดึงข้อความจาก API มาโชว์
        setErrorMsg(data.error || "สมัครสมาชิกไม่สำเร็จ กรุณาลองใหม่");
        toast.error("การสมัครล้มเหลว");
      }
    } catch (error) {
      setErrorMsg("ระบบเชื่อมต่อขัดข้อง กรุณาลองใหม่อีกครั้ง");
      toast.error("เกิดข้อผิดพลาดของเซิร์ฟเวอร์");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-4 relative">
      {/* ปุ่มกลับหน้าแรกมุมซ้ายบน */}
      <Link href="/" className="absolute top-8 left-8 text-sm font-bold text-zinc-500 hover:text-zinc-900 transition flex items-center gap-2">
        <span>←</span> กลับหน้าแรก MickeyHub
      </Link>

      <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-[0_10px_40px_rgb(0,0,0,0.03)] border border-zinc-100 w-full max-w-md">
        
        {isSuccess ? (
          <div className="text-center py-8 animate-fadeIn">
            <svg className="checkmark mb-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
              <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none"/>
              <path className="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
            </svg>
            <h3 className="text-xl font-black text-zinc-900 mb-2">สมัครสมาชิกสำเร็จ!</h3>
            <p className="text-zinc-500 text-sm">กำลังพาท่านไปยังหน้าเข้าสู่ระบบ...</p>
          </div>
        ) : (
          <div className="animate-fadeIn">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-black text-zinc-900 tracking-tight">สมัครสมาชิกใหม่</h1>
              <p className="text-zinc-500 text-sm mt-2">เข้าร่วมคอมมูนิตี้และร้านค้าของเรา</p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              
              {/* กล่องแสดง Error สีแดง (โชว์เตือนถ้าอีเมลซ้ำ) */}
              {errorMsg && (
                <div className="bg-red-50 text-red-600 text-sm font-semibold p-4 rounded-2xl border border-red-100 text-center animate-fadeIn">
                  ⚠️ {errorMsg}
                </div>
              )}

              <input 
                type="text" required placeholder="ชื่อของคุณ" 
                value={formData.name} onChange={(e: any) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3.5 bg-zinc-50/50 border border-zinc-200 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
              />
              <input 
                type="email" required placeholder="อีเมล" 
                value={formData.email} onChange={(e: any) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-3.5 bg-zinc-50/50 border border-zinc-200 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
              />
              <input 
                type="password" required placeholder="รหัสผ่าน (ขั้นต่ำ 6 ตัวอักษร)" minLength={6}
                value={formData.password} onChange={(e: any) => setFormData({...formData, password: e.target.value})}
                className="w-full px-4 py-3.5 bg-zinc-50/50 border border-zinc-200 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
              />
              
              <button 
                type="submit" disabled={isLoading}
                className="w-full bg-zinc-950 hover:bg-zinc-800 text-white font-bold py-4 rounded-2xl transition-all active:scale-[0.98] disabled:opacity-70 shadow-lg shadow-zinc-900/10 mt-2"
              >
                {isLoading ? "กำลังตรวจสอบ..." : "สมัครสมาชิก"}
              </button>
            </form>

            <p className="text-center text-sm text-zinc-500 mt-8">
              มีบัญชีอยู่แล้ว? <Link href="/login" className="text-zinc-900 font-bold hover:underline">เข้าสู่ระบบ</Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}