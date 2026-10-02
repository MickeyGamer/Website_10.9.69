"use client";

import Image from "next/image";
import { ChangeEvent, useState } from "react";
import toast from "react-hot-toast";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
}

interface UploadResponse {
  url?: string;
  error?: string;
}

export default function ImageUpload({
  value,
  onChange,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // ตรวจสอบประเภทไฟล์
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("รองรับเฉพาะ JPG, PNG และ WEBP");
      e.target.value = "";
      return;
    }

    // ตรวจสอบขนาดไฟล์ไม่เกิน 5MB
    if (file.size > 5 * 1024 * 1024) {
      toast.error("ขนาดรูปภาพต้องไม่เกิน 5MB");
      e.target.value = "";
      return;
    }

    setIsUploading(true);

    const loadingToast = toast.loading(
      "กำลังอัปโหลดรูปภาพ..."
    );

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json()) as UploadResponse;

      if (!response.ok || !data.url) {
        toast.error(
          data.error || "เกิดข้อผิดพลาดในการอัปโหลด",
          {
            id: loadingToast,
          }
        );
        return;
      }

      onChange(data.url);

      toast.success("อัปโหลดสำเร็จ!", {
        id: loadingToast,
      });
    } catch (error) {
      console.error("Image upload error:", error);

      toast.error("ระบบขัดข้อง กรุณาลองใหม่", {
        id: loadingToast,
      });
    } finally {
      setIsUploading(false);

      // ทำให้สามารถเลือกไฟล์เดิมซ้ำได้
      e.target.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {value ? (
        <div className="relative aspect-video w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 shadow-sm">
          <Image
            src={value}
            alt="Uploaded preview"
            fill
            sizes="(max-width: 768px) 100vw, 448px"
            className="object-cover"
          />

          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-3 top-3 z-10 rounded-full bg-white/90 p-2 font-bold text-red-600 shadow-sm backdrop-blur-sm transition hover:bg-red-50"
            title="ลบรูปภาพ"
            aria-label="ลบรูปภาพ"
          >
            ✕
          </button>
        </div>
      ) : (
        <label className="flex aspect-video w-full max-w-md cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50/50 transition-colors hover:border-gray-400 hover:bg-gray-50">
          <div className="flex flex-col items-center justify-center pb-6 pt-5">
            <span
              className="mb-3 text-3xl"
              aria-hidden="true"
            >
              {isUploading ? "⏳" : "📸"}
            </span>

            <p className="text-sm font-semibold text-gray-600">
              {isUploading
                ? "กำลังประมวลผล..."
                : "คลิกเพื่ออัปโหลดรูปภาพ"}
            </p>

            <p className="mt-1 text-xs text-gray-400">
              รองรับ JPG, PNG, WEBP (สูงสุด 5MB)
            </p>
          </div>

          <input
            type="file"
            className="hidden"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleUpload}
            disabled={isUploading}
          />
        </label>
      )}
    </div>
  );
}