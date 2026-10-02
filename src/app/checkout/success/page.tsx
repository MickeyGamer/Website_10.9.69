"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <div className="w-24 h-24 bg-accent-soft text-accent rounded-full flex items-center justify-center text-4xl mx-auto mb-8 shadow-sm border border-accent/20">
        ✓
      </div>
      <h1 className="text-3xl font-black text-foreground tracking-tight mb-4">สั่งซื้อสำเร็จ!</h1>
      <p className="text-muted-foreground mb-2">ขอบคุณที่ช้อปปิ้งกับเรา คำสั่งซื้อของคุณกำลังรอการตรวจสอบ</p>

      {orderId && (
        <div className="bg-muted border border-border rounded-xl py-3 px-4 mt-6 mb-10 inline-block">
          <span className="text-sm text-muted-foreground mr-2">หมายเลขคำสั่งซื้อ:</span>
          <span className="font-mono font-bold text-foreground">{orderId}</span>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <Link
          href="/shop"
          className="bg-accent hover:bg-accent/90 text-accent-foreground font-medium py-3.5 rounded-xl transition active:scale-[0.98]"
        >
          กลับไปซื้อสินค้าต่อ
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="py-32 text-center text-muted-foreground">กำลังโหลด...</div>}>
      <SuccessContent />
    </Suspense>
  );
}