"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
      // โหมดเข้าสู่ระบบ
      const res = await signIn("credentials", { redirect: false, ...formData });
      
      if (!res?.error) {
        toast.success("เข้าสู่ระบบสำเร็จ!");
        router.push("/");
        router.refresh();
      } else {
        toast.error("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
        setLoading(false);
      }
    } else {
      // โหมดสมัครสมาชิก
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();

        if (res.ok) {
          toast.success("สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ");
          setIsLogin(true); // สลับกลับมาหน้าล็อกอินอัตโนมัติ
          setFormData({ ...formData, password: "" }); // ล้างรหัสผ่าน
        } else {
          toast.error(data.error || "ไม่สามารถสมัครสมาชิกได้");
        }
      } catch (error) {
        toast.error("ระบบขัดข้อง กรุณาลองใหม่");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50/50 px-4">
      <div className="w-full max-w-[400px] bg-white p-8 sm:p-10 rounded-3xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black tracking-tight text-gray-900 mb-2">
            {isLogin ? "เข้าสู่ระบบ CMS" : "สมัครสมาชิก"}
          </h1>
          <p className="text-sm text-gray-500">
            {isLogin ? "จัดการบล็อกและบทความของคุณ" : "บัญชีแรกจะได้รับสิทธิ์ Admin อัตโนมัติ"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <input 
              type="text" placeholder="ชื่อ - นามสกุล" required={!isLogin} 
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-zinc-900 outline-none transition"
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          )}
          <input 
            type="email" placeholder="อีเมล" required 
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-zinc-900 outline-none transition"
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
          <input 
            type="password" placeholder="รหัสผ่าน" required minLength={6}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-zinc-900 outline-none transition"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />

          <button 
            type="submit" disabled={loading}
            className="w-full bg-zinc-950 hover:bg-zinc-800 text-white font-medium py-3.5 rounded-xl transition active:scale-[0.98] disabled:opacity-70 mt-4"
          >
            {loading ? "กำลังดำเนินการ..." : (isLogin ? "เข้าสู่ระบบ" : "สร้างบัญชี")}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => { setIsLogin(!isLogin); setFormData({name: "", email: "", password: ""}); }} 
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            {isLogin ? "ยังไม่มีบัญชี? สมัครสมาชิก" : "มีบัญชีอยู่แล้ว? เข้าสู่ระบบ"}
          </button>
        </div>
      </div>
    </div>
  );
}