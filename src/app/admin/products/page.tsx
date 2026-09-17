"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [productToDelete, setProductToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products");
      const data = await res.json();
      if (Array.isArray(data)) setProducts(data);
    } catch {
      toast.error("โหลดรายการสินค้าล้มเหลว");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);

    try {
      const res = await fetch(`/api/products/${productToDelete._id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setProducts(products.filter((p) => p._id !== productToDelete._id));
        toast.success("ลบสินค้าเรียบร้อยแล้ว");
        setProductToDelete(null);
      } else {
        toast.error("เกิดข้อผิดพลาดในการลบสินค้า");
      }
    } catch {
      toast.error("ระบบขัดข้อง กรุณาลองใหม่");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-zinc-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04)]">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 tracking-tight">จัดการสินค้า</h1>
          <p className="text-sm text-zinc-500 mt-1">สินค้าทั้งหมดในระบบ {products.length} รายการ</p>
        </div>
        <Link
          href="/admin/products/new"
          className="bg-zinc-950 hover:bg-zinc-800 text-white font-medium px-6 py-3 rounded-2xl transition shadow-lg shadow-zinc-900/10 active:scale-[0.98]"
        >
          + เพิ่มสินค้าใหม่
        </Link>
      </div>

      <div className="bg-white border border-zinc-100 rounded-3xl overflow-hidden shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04)]">
        {loading ? (
          <div className="p-16 text-center text-zinc-400 font-medium">กำลังโหลดข้อมูลสินค้า...</div>
        ) : products.length === 0 ? (
          <div className="p-16 text-center text-zinc-400 font-medium">ยังไม่มีสินค้าในร้านค้า เริ่มต้นเพิ่มชิ้นแรกได้เลย!</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50/75 border-b border-zinc-100 text-zinc-400 uppercase tracking-wider text-xs">
                <tr>
                  <th className="p-6 font-bold">สินค้า</th>
                  <th className="p-6 font-bold">ราคา</th>
                  <th className="p-6 font-bold">คงเหลือ</th>
                  <th className="p-6 font-bold">สถานะ</th>
                  <th className="p-6 font-bold text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {products.map((item) => (
                  <tr key={item._id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-zinc-100 border border-zinc-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {item.images?.[0] ? (
                            <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs text-zinc-400">No Pic</span>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-zinc-900 text-base">{item.name}</p>
                          <p className="text-zinc-400 text-xs mt-0.5">/{item.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6 font-bold text-zinc-900">฿{item.price.toLocaleString()}</td>
                    <td className="p-6">
                      <span className={`font-semibold ${item.stock <= 5 ? "text-amber-600" : "text-zinc-700"}`}>
                        {item.stock} ชิ้น
                      </span>
                    </td>
                    <td className="p-6">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          item.isActive
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                            : "bg-zinc-100 text-zinc-500 border border-zinc-200"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full mr-2 ${item.isActive ? "bg-emerald-500" : "bg-zinc-400"}`} />
                        {item.isActive ? "เปิดขาย" : "ปิดการขาย"}
                      </span>
                    </td>
                    <td className="p-6 text-right space-x-4 font-semibold">
                      <Link href={`/admin/products/${item._id}/edit`} className="text-zinc-600 hover:text-zinc-950 transition">
                        แก้ไข
                      </Link>
                      <button onClick={() => setProductToDelete(item)} className="text-red-500 hover:text-red-700 transition">
                        ลบ
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl border border-zinc-100">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center font-bold text-xl mb-6 mx-auto">
              ⚠️
            </div>
            <h3 className="text-xl font-black text-center text-zinc-900 mb-2">ยืนยันการลบสินค้า?</h3>
            <p className="text-zinc-500 text-center text-sm mb-8 leading-relaxed">
              คุณต้องการลบสินค้า <span className="font-bold text-zinc-800">"{productToDelete.name}"</span> ออกจากระบบอย่างถาวรใช่หรือไม่?
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
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
                {isDeleting ? "กำลังลบ..." : "ลบทันที"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}