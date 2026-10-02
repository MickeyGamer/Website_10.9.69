"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useCartStore } from "@/store/CartStore";

interface ProductActionsProps {
  product: {
    _id: string;
    name: string;
    price: number;
    description: string;
    images: string[];
    stock: number;
  };
}

export default function ProductActions({
  product,
}: ProductActionsProps) {
  const addItem = useCartStore((state) => state.addItem);

  const [quantity, setQuantity] = useState(1);
  const [coupon, setCoupon] = useState("");
  const [showCoupon, setShowCoupon] = useState(false);

  // =========================
  // จำนวนสินค้า
  // =========================

  const increaseQuantity = () => {
    if (quantity < product.stock) {
      setQuantity((prev) => prev + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  // =========================
  // เพิ่มสินค้าเข้าตะกร้า
  // =========================

  const handleAddToCart = () => {
    if (product.stock <= 0) {
      toast.error("สินค้าหมด");
      return;
    }

    if (quantity > product.stock) {
      toast.error("จำนวนสินค้าเกิน Stock");
      return;
    }

    for (let i = 0; i < quantity; i++) {
      addItem(product);
    }

    toast.success(
      `เพิ่ม ${quantity} × ${product.name} ลงตะกร้าแล้ว`
    );
  };

  // =========================
  // ใช้ Coupon
  // =========================

  const handleCoupon = () => {
    const code = coupon.trim();

    if (!code) {
      toast.error("กรุณากรอกโค้ดส่วนลด");
      return;
    }

    /*
      ตอนนี้เป็น UI ก่อน

      ระบบจริงภายหลังควรส่งไปตรวจสอบที่:

      POST /api/coupons/validate

      Server จะตรวจสอบ:
      - โค้ดมีอยู่จริงไหม
      - หมดอายุหรือยัง
      - ใช้ได้กับสินค้านี้ไหม
      - ยอดขั้นต่ำ
      - จำนวนครั้งที่ใช้
      - ผู้ใช้เคยใช้แล้วหรือยัง
    */

    toast.success(`ส่งคำขอตรวจสอบโค้ด "${code}" แล้ว`);
  };

  // =========================
  // ราคา
  // =========================

  const totalPrice = product.price * quantity;

  // =========================
  // สินค้าหมด
  // =========================

  if (product.stock <= 0) {
    return (
      <div className="mt-7 space-y-4">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
          <p className="font-semibold text-red-700">
            สินค้าหมด
          </p>

          <p className="mt-1 text-sm text-red-600">
            ขณะนี้ไม่สามารถเพิ่มสินค้านี้ลงตะกร้าได้
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Link
            href="/shop"
            className="flex items-center justify-center rounded-xl bg-black px-5 py-3 font-semibold text-white transition hover:bg-zinc-800"
          >
            ← กลับไปร้านค้า
          </Link>

          <Link
            href="/cart"
            className="flex items-center justify-center rounded-xl border border-zinc-300 bg-white px-5 py-3 font-semibold text-zinc-800 transition hover:bg-zinc-100"
          >
            🛒 ดูตะกร้า
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-7 space-y-6">

      {/* =====================================
          จำนวนสินค้า
      ===================================== */}

      <section className="rounded-2xl border border-zinc-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="font-semibold text-zinc-900">
              จำนวนสินค้า
            </p>

            <p className="mt-1 text-sm text-zinc-500">
              เหลือ {product.stock.toLocaleString()} ชิ้น
            </p>
          </div>

          <p className="font-semibold text-zinc-900">
            ฿{totalPrice.toLocaleString()}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={decreaseQuantity}
            disabled={quantity <= 1}
            className="h-11 w-11 rounded-xl border border-zinc-300 bg-white text-xl font-semibold transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            −
          </button>

          <div className="flex h-11 min-w-16 items-center justify-center rounded-xl border border-zinc-300 bg-zinc-50 px-4 font-semibold">
            {quantity}
          </div>

          <button
            type="button"
            onClick={increaseQuantity}
            disabled={quantity >= product.stock}
            className="h-11 w-11 rounded-xl border border-zinc-300 bg-white text-xl font-semibold transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            +
          </button>
        </div>
      </section>

      {/* =====================================
          ปุ่มหลัก
      ===================================== */}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={handleAddToCart}
          className="rounded-xl bg-black px-5 py-3 font-semibold text-white transition hover:bg-zinc-800"
        >
          🛒 เพิ่มลงตะกร้า
        </button>

        <Link
          href="/cart"
          className="flex items-center justify-center rounded-xl border border-zinc-300 bg-white px-5 py-3 font-semibold text-zinc-800 transition hover:bg-zinc-100"
        >
          ดูตะกร้า
        </Link>
      </div>

      {/* =====================================
          ซื้อทันที
      ===================================== */}

      <Link
        href={`/checkout?product=${product._id}&quantity=${quantity}`}
        className="flex w-full items-center justify-center rounded-xl border border-zinc-900 px-5 py-3 font-semibold text-zinc-900 transition hover:bg-zinc-900 hover:text-white"
      >
        ⚡ ซื้อสินค้านี้
      </Link>

      {/* =====================================
          Coupon
      ===================================== */}

      <section className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
        <button
          type="button"
          onClick={() => setShowCoupon((prev) => !prev)}
          className="flex w-full items-center justify-between font-semibold text-zinc-900"
        >
          <span>🎟️ มีโค้ดส่วนลด?</span>

          <span>
            {showCoupon ? "▲" : "▼"}
          </span>
        </button>

        {showCoupon && (
          <div className="mt-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={coupon}
                onChange={(e) =>
                  setCoupon(e.target.value.toUpperCase())
                }
                placeholder="กรอกโค้ด เช่น SAVE10"
                maxLength={30}
                className="min-w-0 flex-1 rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm outline-none focus:border-zinc-900"
              />

              <button
                type="button"
                onClick={handleCoupon}
                className="rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-black"
              >
                ใช้โค้ด
              </button>
            </div>

            <p className="mt-2 text-xs text-zinc-500">
              ระบบจะตรวจสอบโค้ดส่วนลดกับ Server ก่อนนำไปใช้จริง
            </p>
          </div>
        )}
      </section>

      {/* =====================================
          ติดต่อเจ้าของสินค้า
      ===================================== */}

      <section className="rounded-2xl border border-zinc-200 bg-white p-5">
        <div className="flex items-start gap-3">
          <div className="text-2xl">
            💬
          </div>

          <div className="flex-1">
            <h3 className="font-semibold text-zinc-900">
              มีคำถามเกี่ยวกับสินค้า?
            </h3>

            <p className="mt-1 text-sm text-zinc-500">
              สามารถพูดคุยกับเจ้าของสินค้าโดยตรงได้
            </p>

            <Link
              href={`/chat?product=${product._id}`}
              className="mt-4 inline-flex rounded-xl border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-100"
            >
              💬 แชทกับเจ้าของสินค้า
            </Link>
          </div>
        </div>
      </section>

      {/* =====================================
          ข้อมูลการจัดส่ง
      ===================================== */}

      <section className="rounded-2xl border border-zinc-200 bg-white p-5">
        <h3 className="font-semibold text-zinc-900">
          🚚 การจัดส่ง
        </h3>

        <div className="mt-3 space-y-2 text-sm text-zinc-600">
          <p>✓ มีระบบติดตามสถานะคำสั่งซื้อ</p>
          <p>✓ ตรวจสอบเลข Tracking ได้</p>
          <p>✓ ดูสถานะการจัดส่งได้จากหน้าคำสั่งซื้อ</p>
        </div>

        <Link
          href="/orders"
          className="mt-4 inline-flex text-sm font-semibold text-zinc-900 underline underline-offset-4"
        >
          ดูคำสั่งซื้อของฉัน
        </Link>
      </section>

      {/* =====================================
          ความปลอดภัย
      ===================================== */}

      <div className="rounded-xl bg-zinc-50 p-4 text-xs text-zinc-500">
        🔒 ราคาสินค้า Stock และส่วนลดควรได้รับการตรวจสอบ
        ซ้ำจาก Server ก่อนสร้างคำสั่งซื้อ
      </div>

      {/* =====================================
          กลับร้านค้า
      ===================================== */}

      <Link
        href="/shop"
        className="inline-flex text-sm font-medium text-zinc-600 transition hover:text-black"
      >
        ← กลับไปร้านค้า
      </Link>
    </div>
  );
}