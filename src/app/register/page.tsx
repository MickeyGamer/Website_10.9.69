"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const router = useRouter();
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data: any = await res.json();

      if (res.ok) {
        setIsSuccess(true);
        setTimeout(() => router.push("/login"), 2000); // 2 วิเด้งไปหน้าล็อกอิน
      } else {
        toast.error(data.error || "สมัครสมาชิกไม่สำเร็จ");
      }
    } catch (error) {
      toast.error("ระบบขัดข้อง กรุณาลองใหม่");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-100 w-full max-w-md">
        
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

            <form onSubmit={handleRegister} className="space-y-5">
              <input 
                type="text" required placeholder="ชื่อของคุณ" 
                value={formData.name} onChange={(e: any) => setFormData({...formData, name: e.target.value})}
                className="w-full px-4 py-3.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
              />
              <input 
                type="email" required placeholder="อีเมล" 
                value={formData.email} onChange={(e: any) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-3.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
              />
              <input 
                type="password" required placeholder="รหัสผ่าน" minLength={6}
                value={formData.password} onChange={(e: any) => setFormData({...formData, password: e.target.value})}
                className="w-full px-4 py-3.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
              />
              
              <button 
                type="submit" disabled={isLoading}
                className="w-full bg-zinc-950 hover:bg-zinc-800 text-white font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] disabled:opacity-70 mt-2"
              >
                {isLoading ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิก"}
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