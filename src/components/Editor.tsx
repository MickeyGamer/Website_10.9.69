"use client";

import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import toast from "react-hot-toast";

interface EditorProps {
  value: string;
  onChange: (val: string) => void;
}

interface UploadResponse {
  url?: string;
  error?: string;
}

export default function Editor({
  value,
  onChange,
}: EditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: true,
        HTMLAttributes: {
          class:
            "rounded-2xl max-w-full my-6 border border-zinc-100 shadow-sm",
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

  const handleImageUpload = async (
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file || !editor) {
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("ขนาดไฟล์รูปภาพต้องไม่เกิน 5MB");
      e.target.value = "";
      return;
    }

    setIsUploading(true);

    const toastId = toast.loading(
      "กำลังอัปโหลดรูปภาพลงบทความ..."
    );

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data =
        (await res.json()) as UploadResponse;

      if (!res.ok || !data.url) {
        throw new Error(
          data.error || "อัปโหลดล้มเหลว"
        );
      }

      editor
        .chain()
        .focus()
        .setImage({
          src: data.url,
        })
        .run();

      toast.success("แทรกรูปภาพเรียบร้อย", {
        id: toastId,
      });
    } catch (error) {
      console.error("Image upload error:", error);

      const message =
        error instanceof Error
          ? error.message
          : "เกิดข้อผิดพลาดในการอัปโหลด";

      toast.error(message, {
        id: toastId,
      });
    } finally {
      setIsUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm transition-colors focus-within:border-zinc-900">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageUpload}
        accept="image/*"
        className="hidden"
      />

      <div className="flex flex-wrap items-center gap-1.5 border-b border-zinc-100 bg-zinc-50/70 p-3 text-sm backdrop-blur-sm">
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleBold().run()
          }
          className={`rounded-lg px-3 py-1.5 font-bold transition-all ${
            editor.isActive("bold")
              ? "bg-zinc-900 text-white"
              : "text-zinc-600 hover:bg-zinc-200"
          }`}
        >
          B
        </button>

        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleItalic().run()
          }
          className={`rounded-lg px-3 py-1.5 italic transition-all ${
            editor.isActive("italic")
              ? "bg-zinc-900 text-white"
              : "text-zinc-600 hover:bg-zinc-200"
          }`}
        >
          I
        </button>

        <div className="mx-1 h-5 w-[1px] bg-zinc-200" />

        <button
          type="button"
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleHeading({ level: 2 })
              .run()
          }
          className={`rounded-lg px-3 py-1.5 font-bold transition-all ${
            editor.isActive("heading", {
              level: 2,
            })
              ? "bg-zinc-900 text-white"
              : "text-zinc-600 hover:bg-zinc-200"
          }`}
        >
          H2
        </button>

        <button
          type="button"
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleHeading({ level: 3 })
              .run()
          }
          className={`rounded-lg px-3 py-1.5 font-semibold transition-all ${
            editor.isActive("heading", {
              level: 3,
            })
              ? "bg-zinc-900 text-white"
              : "text-zinc-600 hover:bg-zinc-200"
          }`}
        >
          H3
        </button>

        <div className="mx-1 h-5 w-[1px] bg-zinc-200" />

        <button
          type="button"
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleBulletList()
              .run()
          }
          className={`rounded-lg px-3 py-1.5 transition-all ${
            editor.isActive("bulletList")
              ? "bg-zinc-900 text-white"
              : "text-zinc-600 hover:bg-zinc-200"
          }`}
        >
          Bullet List
        </button>

        <div className="mx-1 h-5 w-[1px] bg-zinc-200" />

        <button
          type="button"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 font-medium text-zinc-700 shadow-sm transition-all hover:border-zinc-400 active:scale-95 disabled:opacity-50"
        >
          <span>📷</span>

          <span>
            {isUploading
              ? "กำลังอัปโหลด..."
              : "แทรกรูปภาพ"}
          </span>
        </button>
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}