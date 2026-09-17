"use client";

import { useCartStore } from "@/store/CartStore";
import Link from "next/link";
import toast from "react-hot-toast";

export default function CartPage() {
  const { items, removeItem, clearCart } = useCartStore();

  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = () => {
    if (items.length === 0) return toast.error("ไม่มีสินค้าในตะกร้า");
    toast.success("กำลังพาท่านไปหน้าชำระเงิน...");
    // TODO: ส่งข้อมูลไปสร้าง Order ใน Database และไปยังหน้าโอนเงิน
  };

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-32 text-center">
        <div className="text-6xl mb-6">🛒</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">ตะกร้าของคุณยังว่างเปล่า</h1>
        <p className="text-gray-500 mb-8">ลองไปดูสินค้าที่น่าสนใจในร้านค้าของเราสิ</p>
        <Link href="/shop" className="bg-zinc-950 text-white font-medium px-8 py-3.5 rounded-xl transition hover:bg-zinc-800">
          กลับไปเลือกซื้อสินค้า
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-8">ตะกร้าสินค้า</h1>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* รายการสินค้าในตะกร้า */}
        <div className="flex-grow space-y-4">
          {items.map((item) => (
            <div key={item._id} className="flex items-center gap-6 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
              <div className="w-24 h-24 bg-gray-100 rounded-xl flex-shrink-0 flex items-center justify-center text-xs text-gray-400">รูป</div>
              <div className="flex-grow">
                <h3 className="font-bold text-gray-900">{item.name}</h3>
                <p className="text-gray-500 text-sm mt-1">฿{item.price.toLocaleString()} x {item.quantity}</p>
              </div>
              <div className="text-right">
                <p className="font-black text-lg text-gray-900 mb-2">฿{(item.price * item.quantity).toLocaleString()}</p>
                <button 
                  onClick={() => removeItem(item._id)}
                  className="text-red-500 text-sm font-medium hover:underline"
                >
                  ลบทิ้ง
                </button>
              </div>
            </div>
          ))}
          
          <button onClick={clearCart} className="text-gray-400 text-sm font-medium hover:text-gray-900 transition mt-4">
            ล้างตะกร้าทั้งหมด
          </button>
        </div>

        {/* สรุปยอดเงิน (กล่องติดหนึบด้านขวา) */}
        <div className="w-full lg:w-80 shrink-0">
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sticky top-24">
            <h2 className="font-bold text-lg border-b border-gray-100 pb-4 mb-4">สรุปคำสั่งซื้อ</h2>
            
            <div className="space-y-3 mb-6 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>ยอดรวมสินค้า</span>
                <span>฿{totalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>ค่าจัดส่ง</span>
                <span>ฟรี</span>
              </div>
            </div>
            
            <div className="flex justify-between text-xl font-black text-gray-900 mb-8 pt-4 border-t border-gray-100">
              <span>ยอดสุทธิ</span>
              <span>฿{totalPrice.toLocaleString()}</span>
            </div>

            <button 
              onClick={handleCheckout}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-4 rounded-xl transition shadow-lg shadow-blue-600/20 active:scale-[0.98]"
            >
              ดำเนินการชำระเงิน
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}