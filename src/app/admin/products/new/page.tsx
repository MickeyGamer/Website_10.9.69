"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUpload from "@/components/ImageUpload";
import toast from "react-hot-toast";
import Link from "next/link";

export default function NewProductPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    stock: "",
    description: "",
    imageUrl: "",
    isActive: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const toastId = toast.loading("กำลังสร้างรายการสินค้า...");

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          images: formData.imageUrl ? [formData.imageUrl] : [],
        }),
      });

      // เติม : any ตรงนี้
      const data: any = await res.json();

      if (res.ok) {
        toast.success("เพิ่มสินค้าสำเร็จ!", { id: toastId });
        router.push("/admin/products");
        router.refresh();
      } else {
        toast.error(data.error || "เกิดข้อผิดพลาดในการบันทึก", { id: toastId });
      }
    } catch {
      toast.error("ระบบขัดข้อง กรุณาลองใหม่อีกครั้ง", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-900">เพิ่มสินค้าใหม่</h1>
          <p className="text-sm text-zinc-500 mt-2">ระบุรายละเอียดสินค้าลงในคลังร้านค้า</p>
        </div>
        <Link href="/admin/products" className="text-zinc-500 hover:text-zinc-900 font-medium px-4 py-2 bg-zinc-50 hover:bg-zinc-100 rounded-xl transition">
          ยกเลิก
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 md:p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-100 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-zinc-700">ชื่อสินค้า</label>
            <input
              required
              type="text"
              className="w-full px-4 py-3 bg-zinc-50/50 border border-zinc-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all outline-none"
              value={formData.name}
              // เติม e: any
              onChange={(e: any) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-zinc-700">ภาพสินค้า</label>
            <ImageUpload value={formData.imageUrl} onChange={(url) => setFormData({ ...formData, imageUrl: url })} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-zinc-700">ราคา (บาท)</label>
            <input
              required
              type="number"
              min="0"
              className="w-full px-4 py-3 bg-zinc-50/50 border border-zinc-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all outline-none"
              value={formData.price}
              onChange={(e: any) => setFormData({ ...formData, price: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-zinc-700">จำนวนสต็อก</label>
            <input
              required
              type="number"
              min="0"
              className="w-full px-4 py-3 bg-zinc-50/50 border border-zinc-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all outline-none"
              value={formData.stock}
              onChange={(e: any) => setFormData({ ...formData, stock: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-zinc-700">สถานะการแสดงผล</label>
            <select
              className="w-full px-4 py-3 bg-zinc-50/50 border border-zinc-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all outline-none"
              value={formData.isActive ? "true" : "false"}
              onChange={(e: any) => setFormData({ ...formData, isActive: e.target.value === "true" })}
            >
              <option value="true">เปิดขายทันที</option>
              <option value="false">ปิดชั่วคราว</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-zinc-700">รายละเอียดสินค้า</label>
          <textarea
            rows={4}
            className="w-full p-4 bg-zinc-50/50 border border-zinc-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-all outline-none leading-relaxed"
            value={formData.description}
            onChange={(e: any) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="flex justify-end pt-4 border-t border-zinc-100">
          <button type="submit" disabled={saving} className="bg-zinc-950 hover:bg-zinc-800 text-white px-8 py-3.5 rounded-xl font-medium transition-all active:scale-[0.98] disabled:opacity-70 shadow-lg shadow-zinc-900/20">
            {saving ? "กำลังบันทึก..." : "บันทึกสินค้า"}
          </button>
        </div>
      </form>
    </div>
  );
}