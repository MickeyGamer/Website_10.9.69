"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Editor from "@/components/Editor";
import toast from "react-hot-toast";

export default function CommentBox({ threadId }: { threadId: string }) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim() || content === "<p></p>") {
      return toast.error("กรุณาพิมพ์ข้อความก่อนส่ง");
    }

    setSaving(true);
    const toastId = toast.loading("กำลังส่งความคิดเห็น...");

    try {
      const res = await fetch(`/api/threads/${threadId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      const data: any = await res.json();

      if (res.ok) {
        toast.success("แสดงความคิดเห็นสำเร็จ", { id: toastId });
        setContent(""); // ล้างกล่องข้อความ
        router.refresh(); // รีเฟรชหน้าเพื่อดึงคอมเมนต์ใหม่มาโชว์
      } else {
        toast.error(data.error || "ไม่สามารถส่งความคิดเห็นได้", { id: toastId });
      }
    } catch {
      toast.error("ระบบขัดข้อง", { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-100">
      <h4 className="font-bold text-zinc-900 mb-4">ร่วมแสดงความคิดเห็น</h4>
      <div className="mb-4">
        <Editor value={content} onChange={setContent} />
      </div>
      <div className="flex justify-end">
        <button 
          onClick={handleSubmit}
          disabled={saving}
          className="bg-zinc-950 hover:bg-zinc-800 text-white px-8 py-3 rounded-xl font-bold transition-all active:scale-[0.98] disabled:opacity-70 shadow-lg shadow-zinc-900/20"
        >
          {saving ? "กำลังส่ง..." : "ส่งความคิดเห็น"}
        </button>
      </div>
    </div>
  );
}