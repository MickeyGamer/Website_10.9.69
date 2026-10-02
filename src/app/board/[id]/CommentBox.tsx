"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Editor from "@/components/Editor";
import toast from "react-hot-toast";

interface CommentBoxProps {
  threadId: string;
}

export default function CommentBox({ threadId }: CommentBoxProps) {
  const router = useRouter();

  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    // ตรวจสอบข้อความว่าง
    const plainText = content
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim();

    if (!plainText) {
      toast.error("กรุณาพิมพ์ข้อความก่อนส่ง");
      return;
    }

    if (saving) return;

    setSaving(true);

    const toastId = toast.loading("กำลังส่งความคิดเห็น...");

    try {
      const response = await fetch(
        `/api/threads/${threadId}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content,
          }),
        }
      );

      let data: { error?: string } = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        toast.error(
          data.error || "ไม่สามารถส่งความคิดเห็นได้",
          {
            id: toastId,
          }
        );

        return;
      }

      // สำเร็จ
      toast.success("แสดงความคิดเห็นสำเร็จ", {
        id: toastId,
      });

      // ล้าง Editor
      setContent("");

      // รีเฟรช Server Component เพื่อโหลดความคิดเห็นใหม่
      router.refresh();
    } catch (error) {
      console.error("Comment submit error:", error);

      toast.error("ระบบขัดข้อง กรุณาลองใหม่อีกครั้ง", {
        id: toastId,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="bg-white p-6 md:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-100">
      {/* Header */}
      <div className="mb-5">
        <h4 className="text-lg font-bold text-zinc-900">
          ร่วมแสดงความคิดเห็น
        </h4>

        <p className="text-sm text-zinc-500 mt-1">
          แบ่งปันความคิดเห็นของคุณเกี่ยวกับกระทู้นี้
        </p>
      </div>

      {/* Editor */}
      <div className="mb-5">
        <Editor
          value={content}
          onChange={setContent}
        />
      </div>

      {/* Submit */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className="
            bg-zinc-950
            hover:bg-zinc-800
            text-white
            px-8
            py-3
            rounded-xl
            font-bold
            transition-all
            active:scale-[0.98]
            disabled:opacity-60
            disabled:cursor-not-allowed
            shadow-lg
            shadow-zinc-900/20
          "
        >
          {saving ? "กำลังส่ง..." : "ส่งความคิดเห็น"}
        </button>
      </div>
    </section>
  );
}