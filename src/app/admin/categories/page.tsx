"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  // State สำหรับจัดการ Popup ลบ
  const [categoryToDelete, setCategoryToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ดึงข้อมูลหมวดหมู่ทั้งหมด
  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data: any = await res.json();
      if (Array.isArray(data)) setCategories(data);
    } catch {
      toast.error("โหลดข้อมูลหมวดหมู่ล้มเหลว");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // ฟังก์ชันเพิ่มหมวดหมู่ใหม่
  const handleAddCategory = async (e: any) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("กรุณากรอกชื่อหมวดหมู่");

    setSaving(true);
    const toastId = toast.loading("กำลังเพิ่มหมวดหมู่...");

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      if (res.ok) {
        toast.success("เพิ่มหมวดหมู่สำเร็จ!", { id: toastId });
        setName("");
        fetchCategories(); // โหลดข้อมูลใหม่
      } else {
        const errorData: any = await res.json();
        toast.error(errorData.error || "เกิดข้อผิดพลาด", { id: toastId });
      }
    } catch {
      toast.error("ระบบขัดข้อง", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  // ฟังก์ชันยืนยันการลบหมวดหมู่
  const handleDelete = async () => {
    if (!categoryToDelete) return;
    setIsDeleting(true);
    
    const toastId = toast.loading("กำลังลบ...");
    try {
      const res = await fetch(`/api/categories/${categoryToDelete._id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("ลบสำเร็จ!", { id: toastId });
        setCategories(categories.filter((c) => c._id !== categoryToDelete._id));
        setCategoryToDelete(null); // ปิด Popup
      } else {
        toast.error("ลบล้มเหลว", { id: toastId });
      }
    } catch {
      toast.error("ระบบขัดข้อง", { id: toastId });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04)]">
        <h1 className="text-2xl font-black text-zinc-900 tracking-tight">จัดการหมวดหมู่</h1>
        <p className="text-sm text-zinc-500 mt-1">เพิ่มและลบหมวดหมู่สำหรับจัดระเบียบบทความ</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* ฟอร์มเพิ่มหมวดหมู่ (ซ้าย) */}
        <div className="md:col-span-1">
          <form onSubmit={handleAddCategory} className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm sticky top-24">
            <h2 className="font-bold text-zinc-900 mb-4">+ สร้างหมวดหมู่ใหม่</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-zinc-700 mb-2">ชื่อหมวดหมู่</label>
                <input
                  type="text"
                  placeholder="เช่น Lifestyle, Tech..."
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
                  value={name}
                  onChange={(e: any) => setName(e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-zinc-950 hover:bg-zinc-800 text-white font-medium py-3 rounded-xl transition active:scale-[0.98] disabled:opacity-70"
              >
                {saving ? "กำลังบันทึก..." : "เพิ่มหมวดหมู่"}
              </button>
            </div>
          </form>
        </div>

        {/* ตารางแสดงรายการ (ขวา) */}
        <div className="md:col-span-2">
          <div className="bg-white border border-zinc-100 rounded-3xl overflow-hidden shadow-sm">
            {loading ? (
              <div className="p-12 text-center text-zinc-400">กำลังโหลด...</div>
            ) : categories.length === 0 ? (
              <div className="p-12 text-center text-zinc-400">ยังไม่มีหมวดหมู่</div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-50/75 border-b border-zinc-100 text-zinc-400 uppercase tracking-wider text-xs">
                  <tr>
                    <th className="p-6 font-bold">ชื่อหมวดหมู่</th>
                    <th className="p-6 font-bold text-right">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {categories.map((cat) => (
                    <tr key={cat._id} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="p-6">
                        <p className="font-bold text-zinc-900">{cat.name}</p>
                        <p className="text-xs text-zinc-400 mt-0.5">/{cat.slug || cat.name.toLowerCase()}</p>
                      </td>
                      <td className="p-6 text-right">
                        <button
                          onClick={() => setCategoryToDelete(cat)} // เปิด Popup ลบ
                          className="text-red-500 hover:text-red-700 font-semibold transition"
                        >
                          ลบ
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Popup Modal สำหรับยืนยันการลบ */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl border border-zinc-100 transform transition-all">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center font-bold text-xl mb-6 mx-auto">
              ⚠️
            </div>
            <h3 className="text-xl font-black text-center text-zinc-900 mb-2">ยืนยันการลบหมวดหมู่?</h3>
            <p className="text-zinc-500 text-center text-sm mb-8 leading-relaxed">
              คุณต้องการลบหมวดหมู่ <span className="font-bold text-zinc-800">"{categoryToDelete.name}"</span> ใช่ไหม? <br/>(หากลบแล้ว บทความในหมวดหมู่นี้จะไม่มีหมวดหมู่)
            </p>
            <div className="flex gap-3">
              <button 
                type="button"
                onClick={() => setCategoryToDelete(null)}
                disabled={isDeleting}
                className="flex-1 py-3 px-4 rounded-xl border border-zinc-200 hover:bg-zinc-50 font-semibold text-zinc-700 transition"
              >
                ยกเลิก
              </button>
              <button 
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition shadow-lg shadow-red-600/20 disabled:opacity-50"
              >
                {isDeleting ? "กำลังลบ..." : "ลบทิ้งทันที"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}