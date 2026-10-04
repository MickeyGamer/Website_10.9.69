"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCartStore } from "@/store/CartStore"; // ดึง Store มาใช้เพื่อล้างตะกร้า

export default function CheckoutPage() {
  const router = useRouter();
  const { clearCart } = useCartStore(); // เรียกใช้ฟังก์ชันล้างตะกร้า
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // State สำหรับเก็บข้อมูลฟอร์ม
  const [formData, setFormData] = useState({
    name: "",
    cardNumber: "",
    expiry: "",
    cvc: "",
  });

  // ⭐ ฟังก์ชันจัดการการพิมพ์ และบล็อกตัวอักษร
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // ถ้าเป็นช่อง "ชื่อบนบัตร" อนุญาตให้พิมพ์อะไรก็ได้ตามปกติ
    if (name === "name") {
      setFormData({ ...formData, [name]: value });
      return;
    }

    // สำหรับช่องอื่นๆ ให้ลบทุกอย่างที่ไม่ใช่ตัวเลข (0-9) ออกทิ้งให้หมด!
    let rawValue = value.replace(/\D/g, "");

    if (name === "cardNumber") {
      // จัดรูปแบบเลขบัตร: ให้เว้นวรรคทุกๆ 4 ตัว (เช่น 1234 5678 1234 5678)
      rawValue = rawValue.replace(/(\d{4})/g, "$1 ").trim();
      setFormData({ ...formData, [name]: rawValue });
    } 
    else if (name === "expiry") {
      // จัดรูปแบบวันหมดอายุ: ใส่ / คั่นกลางอัตโนมัติ (เช่น 12/25)
      if (rawValue.length >= 3) {
        rawValue = `${rawValue.slice(0, 2)}/${rawValue.slice(2, 4)}`;
      }
      setFormData({ ...formData, [name]: rawValue });
    } 
    else if (name === "cvc") {
      // CVC ปล่อยเป็นตัวเลขล้วน
      setFormData({ ...formData, [name]: rawValue });
    }
  };

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // จำลองระยะเวลาโหลดตัดบัตร 2 วินาที
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);

      // ⭐ ล้างตะกร้าสินค้าผ่าน Zustand Store
      clearCart();

      // พากลับหน้าแรกหลังจากโชว์หน้าสำเร็จ 3 วินาที
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 3000);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-zinc-50 py-12 px-4 flex justify-center items-center">
      <div className="w-full max-w-lg">
        
        {/* ปุ่มกลับ */}
        {!isSuccess && !isProcessing && (
          <Link href="/cart" className="text-zinc-500 hover:text-zinc-900 text-sm mb-6 inline-flex items-center gap-2 transition">
            <span>←</span> กลับไปหน้าตะกร้าสินค้า
          </Link>
        )}

        <div className="bg-white rounded-3xl p-8 md:p-10 shadow-[0_10px_40px_rgb(0,0,0,0.03)] border border-zinc-100">
          
          {isSuccess ? (
            /* หน้าต่างแสดงผลเมื่อชำระเงินสำเร็จ */
            <div className="text-center py-8 animate-fadeIn">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-black text-zinc-900 mb-2">ชำระเงินสำเร็จ!</h2>
              <p className="text-zinc-500 text-sm mb-6">ระบบได้รับยอดเงินของคุณเรียบร้อยแล้ว<br/>กำลังพาท่านกลับสู่หน้าหลัก...</p>
            </div>
          ) : (
            /* ฟอร์มกรอกบัตรเครดิต */
            <div className="animate-fadeIn">
              <div className="mb-8">
                <h1 className="text-2xl font-black text-zinc-900 mb-2">ชำระเงินด้วยบัตรเครดิต</h1>
                <p className="text-zinc-500 text-sm">ยอดชำระสุทธิ: <span className="font-bold text-zinc-900 text-lg">฿200.00</span></p>
              </div>

              <form onSubmit={handlePayment} className="space-y-5">
                
                {/* ชื่อบนบัตร */}
                <div>
                  <label className="block text-sm font-bold text-zinc-900 mb-2">ชื่อบนบัตร (Name on Card)</label>
                  <input 
                    type="text" name="name" required placeholder="JOHN DOE" 
                    value={formData.name} onChange={handleInputChange} // เปลี่ยนมาใช้ handleInputChange
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none transition-all uppercase"
                  />
                </div>

                {/* เลขหมายบัตร */}
                <div>
                  <label className="block text-sm font-bold text-zinc-900 mb-2">หมายเลขบัตร (Card Number)</label>
                  <div className="relative">
                    <input 
                      type="text" name="cardNumber" required placeholder="0000 0000 0000 0000" maxLength={19}
                      value={formData.cardNumber} onChange={handleInputChange} // เปลี่ยนมาใช้ handleInputChange
                      className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none transition-all tracking-wider font-mono"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                      </svg>
                    </div>
                  </div>
                </div>

                {/* วันหมดอายุ & CVC */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-zinc-900 mb-2">วันหมดอายุ (MM/YY)</label>
                    <input 
                      type="text" name="expiry" required placeholder="MM/YY" maxLength={5}
                      value={formData.expiry} onChange={handleInputChange} // เปลี่ยนมาใช้ handleInputChange
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none transition-all text-center font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-zinc-900 mb-2">รหัสความปลอดภัย (CVC)</label>
                    <input 
                      type="text" name="cvc" required placeholder="123" maxLength={3}
                      value={formData.cvc} onChange={handleInputChange} // เปลี่ยนมาใช้ handleInputChange
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none transition-all text-center font-mono"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    type="submit" disabled={isProcessing || formData.cardNumber.length < 19} // ป้องกันกดซับมิทถ้าพิมพ์เลขบัตรไม่ครบ
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all active:scale-[0.98] disabled:opacity-70 shadow-lg shadow-blue-600/20 flex justify-center items-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        กำลังประมวลผล...
                      </>
                    ) : (
                      "ยืนยันการชำระเงิน ฿200.00"
                    )}
                  </button>
                  <p className="text-center text-xs text-zinc-400 mt-4 flex items-center justify-center gap-1">
                    <span>🔒</span> ข้อมูลของคุณได้รับการเข้ารหัสอย่างปลอดภัย
                  </p>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}