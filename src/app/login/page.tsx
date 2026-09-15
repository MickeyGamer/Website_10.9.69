"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (isLogin) {
      // โหมดเข้าสู่ระบบ (Login)
      const res = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (res?.error) {
        setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
        setLoading(false);
      } else {
        router.push("/");
        router.refresh();
      }
    } else {
      // โหมดสมัครสมาชิก (Register)
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (res.ok) {
        alert("สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ");
        setIsLogin(true);
        setLoading(false);
      } else {
        setError(data.error);
        setLoading(false);
      }
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-2xl shadow-sm border">
      <h1 className="text-3xl font-bold text-center mb-8">
        {isLogin ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}
      </h1>
      
      {error && <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-6 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-5">
        {!isLogin && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ - นามสกุล</label>
            <input 
              type="text" required 
              className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
        )}
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
          <input 
            type="email" required 
            className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">รหัสผ่าน</label>
          <input 
            type="password" required minLength={6}
            className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />
        </div>

        <button 
          type="submit" disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
        >
          {loading ? "กำลังดำเนินการ..." : (isLogin ? "เข้าสู่ระบบ" : "สมัครสมาชิก")}
        </button>
      </form>

      <p className="text-center mt-6 text-sm text-gray-600">
        {isLogin ? "ยังไม่มีบัญชีใช่ไหม? " : "มีบัญชีอยู่แล้ว? "}
        <button 
          onClick={() => { setIsLogin(!isLogin); setError(""); }} 
          className="text-blue-600 hover:underline font-medium"
        >
          {isLogin ? "สมัครเลย" : "เข้าสู่ระบบ"}
        </button>
      </p>
    </div>
  );
}