"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Editor from "@/components/Editor";
import toast from "react-hot-toast";

const MAX_LENGTH = 5000;

export default function CommentBox({
  threadId,
}: {
  threadId: string;
}) {
  const router = useRouter();

  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    const cleanContent = content.trim();

    // ตรวจสอบข้อความว่าง
    if (!cleanContent || cleanContent === "<p></p>") {
      toast.error("กรุณาพิมพ์ข้อความก่อนส่ง");
      return;
    }

    // ตรวจสอบความยาว
    if (cleanContent.length > MAX_LENGTH) {
      toast.error(
        `ความคิดเห็นต้องไม่เกิน ${MAX_LENGTH.toLocaleString()} ตัวอักษร`
      );
      return;
    }

    // ป้องกันการกดส่งซ้ำ
    if (saving) return;

    setSaving(true);

    const toastId = toast.loading(
      "กำลังส่งความคิดเห็น..."
    );

    try {
      const res = await fetch(
        `/api/threads/${threadId}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: cleanContent,
          }),
        }
      );

      const data = await res.json().catch(() => null);

      if (res.ok) {
        toast.success(
          "แสดงความคิดเห็นสำเร็จ",
          {
            id: toastId,
          }
        );

        // ล้างข้อความ
        setContent("");

        // โหลดความคิดเห็นใหม่
        router.refresh();
      } else {
        toast.error(
          data?.error ||
            data?.message ||
            "ไม่สามารถส่งความคิดเห็นได้",
          {
            id: toastId,
          }
        );
      }
    } catch (error) {
      console.error(
        "Comment submit error:",
        error
      );

      toast.error(
        "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้",
        {
          id: toastId,
        }
      );
    } finally {
      setSaving(false);
    }
  };

  const handleClear = () => {
    if (!content.trim()) return;

    const confirmed = window.confirm(
      "ต้องการล้างข้อความความคิดเห็นหรือไม่?"
    );

    if (confirmed) {
      setContent("");
    }
  };

  return (
    <div className="rounded-3xl border border-zinc-100 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] md:p-8">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between gap-4">
        <h4 className="font-bold text-zinc-900">
          ร่วมแสดงความคิดเห็น
        </h4>

        <span
          className={`text-xs font-medium ${
            content.length > MAX_LENGTH
              ? "text-red-500"
              : "text-zinc-400"
          }`}
        >
          {content.length.toLocaleString()} /{" "}
          {MAX_LENGTH.toLocaleString()}
        </span>
      </div>

      {/* Editor */}
      <div className="mb-4">
        <Editor
          value={content}
          onChange={setContent}
        />
      </div>

      {/* Actions */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        {/* Clear */}
        <button
          type="button"
          onClick={handleClear}
          disabled={
            saving || !content.trim()
          }
          className="rounded-xl border border-gray-200 px-6 py-3 font-semibold text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          ล้างข้อความ
        </button>

        {/* Submit */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={
            saving ||
            !content.trim() ||
            content.length > MAX_LENGTH
          }
          className="rounded-xl bg-zinc-950 px-8 py-3 font-bold text-white shadow-lg shadow-zinc-900/20 transition-all hover:bg-zinc-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              กำลังส่ง...
            </span>
          ) : (
            "ส่งความคิดเห็น"
          )}
        </button>
      </div>

      {/* Helper */}
      <p className="mt-3 text-xs text-zinc-400">
        กรุณาใช้ถ้อยคำสุภาพและแบ่งปันความคิดเห็นอย่างสร้างสรรค์
      </p>
    </div>
  );
}