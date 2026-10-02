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
        <h1 className="text-2xl font-bold text-foreground mb-4">ไม่มีสินค้าให้ชำระเงิน</h1>
        <Link href="/shop" className="text-accent font-medium hover:underline">
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

      const data: { orderId?: string; error?: string } = await res.json();

      if (res.ok && data.orderId) {
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
      <h1 className="text-3xl font-black text-foreground tracking-tight mb-8">ชำระเงิน (Checkout)</h1>

      <div className="flex flex-col md:flex-row gap-10">
        {/* คอลัมน์ซ้าย: ข้อมูลการชำระเงิน */}
        <div className="flex-grow space-y-6">
          <div className="bg-background border border-border rounded-3xl p-8 shadow-sm">
            <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <span>🏦</span> ช่องทางการโอนเงิน
            </h2>

            <div className="flex flex-col sm:flex-row gap-8 items-center bg-muted p-6 rounded-2xl border border-border">
              <div className="w-48 h-48 bg-background border-2 border-dashed border-border rounded-2xl flex items-center justify-center text-muted-foreground text-sm">
                [พื้นที่วาง QR Code]
              </div>
              <div className="space-y-3 flex-grow text-center sm:text-left">
                <p className="font-semibold text-foreground">ธนาคารกสิกรไทย (KBANK)</p>
                <p className="text-2xl font-black text-foreground tracking-wider">123-4-56789-0</p>
                <p className="text-muted-foreground">ชื่อบัญชี: บจก. มิกกี้ ฮับ</p>
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">
                    ⚠️ กรุณาโอนเงินยอดสุทธิ: ฿{totalPrice.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* คอลัมน์ขวา: สรุปคำสั่งซื้อ */}
        <div className="w-full md:w-96 shrink-0">
          <div className="bg-background border border-border rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sticky top-24">
            <h2 className="font-bold text-lg text-foreground border-b border-border pb-4 mb-4">สรุปยอดสั่งซื้อ</h2>

            <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
              {items.map((item) => (
                <div key={item._id} className="flex justify-between text-sm">
                  <div className="text-muted-foreground pr-4">
                    <span className="font-medium text-foreground">{item.quantity}x</span> {item.name}
                  </div>
                  <div className="font-medium text-foreground whitespace-nowrap">
                    ฿{(item.price * item.quantity).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between text-xl font-black text-foreground mb-8 pt-4 border-t border-border">
              <span>ยอดรวมทั้งสิ้น</span>
              <span className="text-accent">฿{totalPrice.toLocaleString()}</span>
            </div>

            <button
              onClick={handleConfirmOrder}
              disabled={isProcessing}
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-medium py-4 rounded-xl transition shadow-lg shadow-accent/20 active:scale-[0.98] disabled:opacity-70"
            >
              {isProcessing ? "กำลังประมวลผล..." : "ยืนยันการโอนเงิน"}
            </button>
            <p className="text-xs text-muted-foreground text-center mt-4">
              คลิกเพื่อยืนยันว่าคุณได้ทำการโอนเงินเรียบร้อยแล้ว
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}