"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react"; // อิมพอร์ตระบบล็อกอินของจริง
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // ยิงคำสั่งไปเช็คกับ MongoDB ผ่าน NextAuth
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false, // ปิดรีไดเรกต์ออโต้เพื่อเอามาโชว์ติ๊กถูกก่อน
    });

    if (res?.error) {
      toast.error("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      setIsLoading(false);
    } else {
      // ผ่าน!
      setIsSuccess(true);
      setTimeout(() => {
        router.push("/"); // 2 วิเด้งไปหน้าแรก
        router.refresh(); // รีเฟรชให้ Navbar เปลี่ยนเป็นสถานะล็อกอิน
      }, 2000);
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
            <h3 className="text-xl font-black text-zinc-900 mb-2">กำลังนำท่านเข้าสู่ระบบ...</h3>
            <p className="text-zinc-500 text-sm">กรุณารอสักครู่</p>
          </div>
        ) : (
          <div className="animate-fadeIn">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-black text-zinc-900 tracking-tight">เข้าสู่ระบบ MickeyHub</h1>
              <p className="text-zinc-500 text-sm mt-2">จัดการบล็อกและบทความของคุณ</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <input 
                type="email" required placeholder="อีเมล" 
                value={email} onChange={(e: any) => setEmail(e.target.value)}
                className="w-full px-4 py-3.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
              />
              <input 
                type="password" required placeholder="รหัสผ่าน" 
                value={password} onChange={(e: any) => setPassword(e.target.value)}
                className="w-full px-4 py-3.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
              />
              
              <button 
                type="submit" disabled={isLoading}
                className="w-full bg-zinc-950 hover:bg-zinc-800 text-white font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] disabled:opacity-70 mt-2"
              >
                {isLoading ? "กำลังตรวจสอบ..." : "เข้าสู่ระบบ"}
              </button>
            </form>

            <p className="text-center text-sm text-zinc-500 mt-8">
              ยังไม่มีบัญชี? <Link href="/register" className="text-zinc-900 font-bold hover:underline">สมัครสมาชิก</Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}