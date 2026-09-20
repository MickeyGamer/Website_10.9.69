"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // เพิ่ม State สำหรับเก็บข้อความ Error
  const [errorMsg, setErrorMsg] = useState("");
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(""); // ล้างข้อความ Error เก่าออกก่อน

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      // ถ้าเข้าสู่ระบบไม่ผ่าน ให้โชว์ข้อความสีแดง
      setErrorMsg("อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง");
      setIsLoading(false);
    } else {
      setIsSuccess(true);
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-4 relative">
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
            <h3 className="text-xl font-black text-zinc-900 mb-2">กำลังนำท่านเข้าสู่ระบบ...</h3>
            <p className="text-zinc-500 text-sm">ยินดีต้อนรับกลับสู่ MickeyHub</p>
          </div>
        ) : (
          <div className="animate-fadeIn">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-black text-zinc-900 tracking-tight">เข้าสู่ระบบ MickeyHub</h1>
              <p className="text-zinc-500 text-sm mt-2">จัดการบล็อกและบทความของคุณ</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              
              {/* กล่องแสดง Error สีแดง (จะโชว์ก็ต่อเมื่อมี Error) */}
              {errorMsg && (
                <div className="bg-red-50 text-red-600 text-sm font-semibold p-4 rounded-2xl border border-red-100 text-center animate-fadeIn">
                  ⚠️ {errorMsg}
                </div>
              )}

              <div>
                <input 
                  type="email" required placeholder="อีเมลของคุณ" 
                  value={email} onChange={(e: any) => setEmail(e.target.value)}
                  className="w-full px-4 py-3.5 bg-zinc-50/50 border border-zinc-200 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
                />
              </div>
              <div>
                <input 
                  type="password" required placeholder="รหัสผ่าน" 
                  value={password} onChange={(e: any) => setPassword(e.target.value)}
                  className="w-full px-4 py-3.5 bg-zinc-50/50 border border-zinc-200 rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
                />
              </div>
              
              <button 
                type="submit" disabled={isLoading}
                className="w-full bg-zinc-950 hover:bg-zinc-800 text-white font-bold py-4 rounded-2xl transition-all active:scale-[0.98] disabled:opacity-70 shadow-lg shadow-zinc-900/10 mt-2"
              >
                {isLoading ? "กำลังตรวจสอบ..." : "เข้าสู่ระบบ"}
              </button>
            </form>

            <p className="text-center text-sm text-zinc-500 mt-8">
              ยังไม่มีบัญชีใช่ไหม? <Link href="/register" className="text-zinc-900 font-bold hover:underline">สมัครสมาชิก</Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}