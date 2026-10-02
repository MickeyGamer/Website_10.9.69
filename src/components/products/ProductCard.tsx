"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";

import { useCartStore } from "@/store/CartStore";

interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    price: number;
    description?: string;
    images?: string[];
    stock: number;
    category?: string;
  };
}

export default function ProductCard({
  product,
}: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);

  const [isFavorite, setIsFavorite] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);

  const productUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/shop/${product._id}`
      : `/shop/${product._id}`;

  const image =
    product.images && product.images.length > 0
      ? product.images[0]
      : null;

  const isOutOfStock = product.stock <= 0;

  // ==========================================
  // เพิ่มลงตะกร้า
  // ==========================================

  const handleAddToCart = () => {
    if (isOutOfStock) {
      toast.error("สินค้าหมด");
      return;
    }

    addItem(product);

    toast.success(
      `เพิ่ม "${product.name}" ลงตะกร้าแล้ว`
    );
  };

  // ==========================================
  // Favorite
  // ==========================================

  const handleFavorite = () => {
    setIsFavorite((prev) => !prev);

    toast.success(
      isFavorite
        ? "นำสินค้าออกจากรายการโปรดแล้ว"
        : "เพิ่มสินค้าในรายการโปรดแล้ว"
    );
  };

  // ==========================================
  // Copy Link
  // ==========================================

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(productUrl);

      setCopied(true);

      toast.success("คัดลอกลิงก์สินค้าแล้ว");

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      toast.error("ไม่สามารถคัดลอกลิงก์ได้");
    }
  };

  // ==========================================
  // Share
  // ==========================================

  const shareProduct = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text:
            product.description ||
            `ดูสินค้า ${product.name}`,
          url: productUrl,
        });
      } catch {
        // ผู้ใช้ยกเลิก Share
      }

      return;
    }

    await copyLink();
  };

  // ==========================================
  // QR Code
  // ==========================================

  const qrUrl =
    `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
      productUrl
    )}`;

  return (
    <article className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">

      {/* =====================================
          Product Image
      ===================================== */}

      <div className="relative aspect-square overflow-hidden bg-zinc-100">

        <Link href={`/shop/${product._id}`}>
          {image ? (
            <Image
              src={image}
              alt={product.name}
              fill
              className="object-cover transition duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-5xl">
              🛒
            </div>
          )}
        </Link>

        {/* Stock Badge */}

        <div className="absolute left-3 top-3">
          {isOutOfStock ? (
            <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white">
              สินค้าหมด
            </span>
          ) : product.stock <= 5 ? (
            <span className="rounded-full bg-orange-500 px-3 py-1 text-xs font-semibold text-white">
              เหลือ {product.stock}
            </span>
          ) : (
            <span className="rounded-full bg-green-600 px-3 py-1 text-xs font-semibold text-white">
              มีสินค้า
            </span>
          )}
        </div>

        {/* Favorite */}

        <button
          type="button"
          onClick={handleFavorite}
          aria-label={
            isFavorite
              ? "นำออกจากรายการโปรด"
              : "เพิ่มรายการโปรด"
          }
          className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-lg shadow-sm backdrop-blur transition hover:scale-105"
        >
          {isFavorite ? "❤️" : "♡"}
        </button>
      </div>

      {/* =====================================
          Product Content
      ===================================== */}

      <div className="p-5">

        {/* Category */}

        {product.category && (
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
            {product.category}
          </p>
        )}

        {/* Product Name */}

        <Link href={`/shop/${product._id}`}>
          <h2 className="mt-1 line-clamp-2 text-lg font-bold text-zinc-900 transition hover:text-zinc-600">
            {product.name}
          </h2>
        </Link>

        {/* Description */}

        {product.description && (
          <p className="mt-2 line-clamp-2 text-sm leading-5 text-zinc-500">
            {product.description}
          </p>
        )}

        {/* Price */}

        <div className="mt-4">
          <span className="text-xl font-bold text-zinc-900">
            ฿{product.price.toLocaleString()}
          </span>
        </div>

        {/* =====================================
            Main Buttons
        ===================================== */}

        <div className="mt-4 grid grid-cols-2 gap-2">

          <Link
            href={`/shop/${product._id}`}
            className="flex items-center justify-center rounded-xl border border-zinc-300 px-3 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100"
          >
            ดูรายละเอียด
          </Link>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="rounded-xl bg-zinc-900 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300"
          >
            🛒 เพิ่มตะกร้า
          </button>

        </div>

        {/* =====================================
            Share
        ===================================== */}

        <button
          type="button"
          onClick={() => setShowShare((prev) => !prev)}
          className="mt-3 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-50"
        >
          🔗 แชร์สินค้า
        </button>

        {/* =====================================
            Share Panel
        ===================================== */}

        {showShare && (
          <div className="mt-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">

            <p className="font-semibold text-zinc-900">
              แชร์สินค้า
            </p>

            {/* Link */}

            <div className="mt-3 flex gap-2">

              <input
                type="text"
                value={productUrl}
                readOnly
                aria-label="ลิงก์สินค้า"
                className="min-w-0 flex-1 rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-600 outline-none"
              />

              <button
                type="button"
                onClick={copyLink}
                className="rounded-xl bg-zinc-900 px-3 py-2 text-xs font-semibold text-white"
              >
                {copied ? "✓" : "คัดลอก"}
              </button>

            </div>

            {/* Share Buttons */}

            <div className="mt-3 grid grid-cols-2 gap-2">

              <button
                type="button"
                onClick={shareProduct}
                className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100"
              >
                📤 แชร์
              </button>

              <button
                type="button"
                onClick={() => {
                  document
                    .getElementById(
                      `product-qr-${product._id}`
                    )
                    ?.scrollIntoView({
                      behavior: "smooth",
                      block: "center",
                    });
                }}
                className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100"
              >
                📱 QR
              </button>

            </div>

            {/* QR */}

            <div
              id={`product-qr-${product._id}`}
              className="mt-4 flex flex-col items-center rounded-xl bg-white p-4"
            >
              <p className="mb-3 text-xs font-semibold text-zinc-600">
                สแกนเพื่อดูสินค้า
              </p>

              <Image
                src={qrUrl}
                alt={`QR Code สำหรับ ${product.name}`}
                width={220}
                height={220}
                className="rounded-lg"
              />

              <p className="mt-2 max-w-full break-all text-center text-[10px] text-zinc-400">
                {productUrl}
              </p>
            </div>

          </div>
        )}

      </div>
    </article>
  );
}