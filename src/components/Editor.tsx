"use client";

import { useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import toast from "react-hot-toast";

interface EditorProps {
  value: string;
  onChange: (val: string) => void;
}

export default function Editor({ value, onChange }: EditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: true,
        HTMLAttributes: {
          class: "rounded-2xl max-w-full my-6 border border-zinc-100 shadow-sm",
        },
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class:
          "prose prose-zinc max-w-none min-h-[320px] p-6 focus:outline-none bg-white text-zinc-900 leading-relaxed",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    immediatelyRender: false,
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("ขนาดไฟล์รูปภาพต้องไม่เกิน 5MB");
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading("กำลังอัปโหลดรูปภาพลงบทความ...");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "อัปโหลดล้มเหลว");
      }

      // แทรกภาพลงตรงเคอร์เซอร์ปัจจุบัน
      editor.chain().focus().setImage({ src: data.url }).run();
      toast.success("แทรกรูปภาพเรียบร้อย", { id: toastId });
    } catch (error: any) {
      toast.error(error.message || "เกิดข้อผิดพลาดในการอัปโหลด", { id: toastId });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (!editor) return null;

  return (
    <div className="border border-zinc-200 rounded-3xl overflow-hidden bg-white shadow-sm focus-within:border-zinc-900 transition-colors">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Toolbar */}
      <div className="flex items-center gap-1.5 p-3 border-b border-zinc-100 bg-zinc-50/70 backdrop-blur-sm flex-wrap text-sm">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
            editor.isActive("bold")
              ? "bg-zinc-900 text-white shadow-sm"
              : "text-zinc-600 hover:bg-zinc-200/60"
          }`}
        >
          B
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-3 py-1.5 rounded-lg italic transition-all ${
            editor.isActive("italic")
              ? "bg-zinc-900 text-white shadow-sm"
              : "text-zinc-600 hover:bg-zinc-200/60"
          }`}
        >
          I
        </button>
        <div className="w-[1px] h-5 bg-zinc-200 mx-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
            editor.isActive("heading", { level: 2 })
              ? "bg-zinc-900 text-white shadow-sm"
              : "text-zinc-600 hover:bg-zinc-200/60"
          }`}
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
            editor.isActive("heading", { level: 3 })
              ? "bg-zinc-900 text-white shadow-sm"
              : "text-zinc-600 hover:bg-zinc-200/60"
          }`}
        >
          H3
        </button>
        <div className="w-[1px] h-5 bg-zinc-200 mx-1" />
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-3 py-1.5 rounded-lg transition-all ${
            editor.isActive("bulletList")
              ? "bg-zinc-900 text-white shadow-sm"
              : "text-zinc-600 hover:bg-zinc-200/60"
          }`}
        >
          Bullet List
        </button>

        <div className="w-[1px] h-5 bg-zinc-200 mx-1" />

        {/* ปุ่มแทรกรูปภาพ */}
        <button
          type="button"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-zinc-700 bg-white border border-zinc-200 hover:border-zinc-400 font-medium transition-all shadow-sm active:scale-95 disabled:opacity-50"
        >
          <span>📷</span>
          <span>{isUploading ? "กำลังอัปโหลด..." : "แทรกรูปภาพ"}</span>
        </button>
      </div>

      {/* Editor Content Area */}
      <EditorContent editor={editor} />
    </div>
  );
}