"use client";

import Image from "next/image";
import { useState } from "react";

interface ShareArticleProps {
  title: string;
  slug: string;
}

export default function ShareArticle({
  title,
  slug,
}: ShareArticleProps) {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const articleUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/blog/${slug}`
      : `/blog/${slug}`;

  // ==============================
  // คัดลอกลิงก์
  // ==============================

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(articleUrl);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      alert("ไม่สามารถคัดลอกลิงก์ได้");
    }
  };

  // ==============================
  // แชร์บทความ
  // ==============================

  const shareArticle = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: title,
          url: articleUrl,
        });
      } catch {
        // ผู้ใช้ยกเลิกการแชร์
      }

      return;
    }

    await copyLink();
  };

  // ==============================
  // QR Code
  // ==============================

  const qrUrl =
    `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
      articleUrl
    )}`;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-lg font-bold text-zinc-900">
          แชร์บทความ
        </h2>

        <p className="mt-1 text-sm text-zinc-500">
          แชร์บทความนี้ให้เพื่อนของคุณ
        </p>
      </div>

      {/* URL */}
      <div className="flex gap-2">
        <input
          type="text"
          value={articleUrl}
          readOnly
          aria-label="ลิงก์บทความ"
          className="min-w-0 flex-1 rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-2 text-xs text-zinc-600 outline-none"
        />

        <button
          type="button"
          onClick={copyLink}
          className="shrink-0 rounded-xl bg-zinc-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-zinc-800"
        >
          {copied ? "✓ คัดลอกแล้ว" : "คัดลอก"}
        </button>
      </div>

      {/* Buttons */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={shareArticle}
          className="rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100"
        >
          📤 แชร์
        </button>

        <button
          type="button"
          onClick={() => setShowQR((prev) => !prev)}
          className="rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100"
        >
          📱 {showQR ? "ซ่อน QR" : "QR Code"}
        </button>
      </div>

      {/* QR Code */}
      {showQR && (
        <div className="mt-5 flex flex-col items-center rounded-xl bg-zinc-50 p-5">
          <p className="mb-3 text-sm font-semibold text-zinc-700">
            สแกนเพื่อเปิดบทความ
          </p>

          <Image
            src={qrUrl}
            alt={`QR Code สำหรับ ${title}`}
            width={240}
            height={240}
            className="rounded-lg bg-white p-2"
            unoptimized
          />

          <p className="mt-3 max-w-full break-all text-center text-xs text-zinc-400">
            {articleUrl}
          </p>
        </div>
      )}
    </div>
  );
}