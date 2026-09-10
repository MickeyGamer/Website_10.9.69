"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

export default function Editor({ value, onChange }: { value: string; onChange: (val: string) => void }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    editorProps: {
      attributes: {
        class: "prose max-w-none min-h-[300px] p-4 focus:outline-none bg-white",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  if (!editor) return null;

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* แถบเครื่องมือ */}
      <div className="flex gap-2 p-2 border-b bg-gray-50 flex-wrap">
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={`px-3 py-1 rounded ${editor.isActive("bold") ? "bg-gray-200" : ""}`}>B</button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={`px-3 py-1 rounded ${editor.isActive("italic") ? "bg-gray-200" : ""}`}>I</button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`px-3 py-1 rounded ${editor.isActive("heading", { level: 2 }) ? "bg-gray-200" : ""}`}>H2</button>
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={`px-3 py-1 rounded ${editor.isActive("bulletList") ? "bg-gray-200" : ""}`}>List</button>
      </div>
      {/* พื้นที่พิมพ์ */}
      <EditorContent editor={editor} />
    </div>
  );
}