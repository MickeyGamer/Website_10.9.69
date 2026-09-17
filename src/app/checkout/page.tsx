"use client";

import { useState } from "react";
import { useCartStore } from "@/store/CartStore";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCartStore();
  const [isProcessing, setIsProcessing] = useState(false);

  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // ถ้าแอบเข้าหน้านี้โดยที่ตะกร้าว่างเปล่า ให้เด้งกลับไปหน้าร้านค้า
  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-32 text-center">
        <h1 className="text-2xl font-bold text-zinc-900 mb-4">ไม่มีสินค้าให้ชำระเงิน</h1>
        <Link href="/shop" className="text-blue-600 font-medium hover:underline">
          กลับไปเลือกซื้อสินค้า
        </Link>
      </div>
    );
  }

  const handleConfirmOrder = async () => {
    setIsProcessing(true);
    const toastId = toast.loading("กำลังสร้างคำสั่งซื้อ...");

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, totalAmount: totalPrice }),
      });

      const data: any = await res.json();

      if (res.ok) {
        toast.success("สั่งซื้อสำเร็จ!", { id: toastId });
        clearCart(); // ล้างตะกร้าทันทีที่สั่งซื้อเสร็จ
        router.push(`/checkout/success?orderId=${data.orderId}`);
      } else {
        // กรณี Error (เช่น ยังไม่ล็อกอิน)
        toast.error(data.error || "เกิดข้อผิดพลาดในการสั่งซื้อ", { id: toastId });
        if (res.status === 401) {
          router.push("/api/auth/signin"); // เด้งไปหน้าล็อกอิน
        }
      }
    } catch {
      toast.error("ระบบขัดข้อง กรุณาลองใหม่", { id: toastId });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-black text-zinc-900 tracking-tight mb-8">ชำระเงิน (Checkout)</h1>

      <div className="flex flex-col md:flex-row gap-10">
        {/* คอลัมน์ซ้าย: ข้อมูลการชำระเงิน */}
        <div className="flex-grow space-y-6">
          <div className="bg-white border border-zinc-100 rounded-3xl p-8 shadow-sm">
            <h2 className="text-xl font-bold text-zinc-900 mb-6 flex items-center gap-2">
              <span>🏦</span> ช่องทางการโอนเงิน
            </h2>
            
            <div className="flex flex-col sm:flex-row gap-8 items-center bg-zinc-50 p-6 rounded-2xl border border-zinc-200">
              <div className="w-48 h-48 bg-white border-2 border-dashed border-zinc-300 rounded-2xl flex items-center justify-center text-zinc-400 text-sm">
                [พื้นที่วาง QR Code]
              </div>
              <div className="space-y-3 flex-grow text-center sm:text-left">
                <p className="font-semibold text-zinc-900">ธนาคารกสิกรไทย (KBANK)</p>
                <p className="text-2xl font-black text-zinc-900 tracking-wider">123-4-56789-0</p>
                <p className="text-zinc-500">ชื่อบัญชี: บจก. มิกกี้ ฮับ</p>
                <div className="mt-4 pt-4 border-t border-zinc-200">
                  <p className="text-sm text-amber-600 font-medium">⚠️ กรุณาโอนเงินยอดสุทธิ: ฿{totalPrice.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* คอลัมน์ขวา: สรุปคำสั่งซื้อ */}
        <div className="w-full md:w-96 shrink-0">
          <div className="bg-white border border-zinc-100 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sticky top-24">
            <h2 className="font-bold text-lg border-b border-zinc-100 pb-4 mb-4">สรุปยอดสั่งซื้อ</h2>
            
            <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
              {items.map((item) => (
                <div key={item._id} className="flex justify-between text-sm">
                  <div className="text-zinc-600 pr-4">
                    <span className="font-medium text-zinc-900">{item.quantity}x</span> {item.name}
                  </div>
                  <div className="font-medium text-zinc-900 whitespace-nowrap">
                    ฿{(item.price * item.quantity).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-between text-xl font-black text-zinc-900 mb-8 pt-4 border-t border-zinc-100">
              <span>ยอดรวมทั้งสิ้น</span>
              <span className="text-blue-600">฿{totalPrice.toLocaleString()}</span>
            </div>

            <button 
              onClick={handleConfirmOrder}
              disabled={isProcessing}
              className="w-full bg-zinc-950 hover:bg-zinc-800 text-white font-medium py-4 rounded-xl transition shadow-lg shadow-zinc-900/20 active:scale-[0.98] disabled:opacity-70"
            >
              {isProcessing ? "กำลังประมวลผล..." : "ยืนยันการโอนเงิน"}
            </button>
            <p className="text-xs text-zinc-400 text-center mt-4">
              คลิกเพื่อยืนยันว่าคุณได้ทำการโอนเงินเรียบร้อยแล้ว
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}