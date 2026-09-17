"use client";

import { useState } from "react";
import toast from "react-hot-toast";

interface ImageUploadProps {
  value: string; // URL รูปภาพปัจจุบัน
  onChange: (url: string) => void; // ฟังก์ชันอัปเดต URL กลับไปที่ฟอร์ม
}

export default function ImageUpload({ value, onChange }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // เช็คขนาดไฟล์ (ไม่เกิน 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return toast.error("ขนาดรูปภาพต้องไม่เกิน 5MB");
    }

    setIsUploading(true);
    const loadingToast = toast.loading("กำลังอัปโหลดรูปภาพ...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        onChange(data.url); // ส่ง URL กลับไปให้ฟอร์มหลัก
        toast.success("อัปโหลดสำเร็จ!", { id: loadingToast });
      } else {
        toast.error(data.error || "เกิดข้อผิดพลาด", { id: loadingToast });
      }
    } catch (error) {
      toast.error("ระบบขัดข้อง กรุณาลองใหม่", { id: loadingToast });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* พื้นที่แสดงรูปภาพ */}
      {value ? (
        <div className="relative aspect-video w-full max-w-md rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 shadow-sm">
          <img src={value} alt="Uploaded preview" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-red-600 font-bold p-2 rounded-full shadow-sm hover:bg-red-50 transition"
            title="ลบรูปภาพ"
          >
            ✕
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full max-w-md aspect-video rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50/50 hover:bg-gray-50 hover:border-gray-400 cursor-pointer transition-colors">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <span className="text-3xl mb-3">{isUploading ? "⏳" : "📸"}</span>
            <p className="text-sm font-semibold text-gray-600">
              {isUploading ? "กำลังประมวลผล..." : "คลิกเพื่ออัปโหลดรูปภาพ"}
            </p>
            <p className="text-xs text-gray-400 mt-1">รองรับ JPG, PNG, WEBP (สูงสุด 5MB)</p>
          </div>
          <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={isUploading} />
        </label>
      )}
    </div>
  );
}