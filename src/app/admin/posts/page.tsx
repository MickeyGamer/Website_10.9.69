"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface IPost {
  _id: string;
  title: string;
  status: string;
  createdAt: string;
}

export default function ManagePostsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<IPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch("/api/posts");
        if (!res.ok) throw new Error("ดึงข้อมูลไม่สำเร็จ");
        const data = await res.json();
        setPosts(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบบทความนี้?")) return;

    try {
      const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("ลบข้อมูลไม่สำเร็จ");
      alert("ลบบทความเรียบร้อยแล้ว!");
      setPosts(posts.filter((post) => post._id !== id));
      router.refresh();
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 py-12 px-4 md:px-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <Link href="/admin" className="text-zinc-500 hover:text-zinc-900 font-medium text-sm flex items-center gap-2 mb-2 transition">
              <span>←</span> กลับหน้าแรก Admin
            </Link>
            <h1 className="text-3xl font-black text-zinc-900">จัดการบทความ (Posts)</h1>
          </div>
          <Link 
            href="/admin/posts/new" 
            className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg flex items-center gap-2"
          >
            <span>➕</span> สร้างบทความใหม่
          </Link>
        </div>

        <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50/50 border-b border-zinc-100">
                  <th className="py-4 px-6 text-xs font-bold text-zinc-500 uppercase">หัวข้อบทความ</th>
                  <th className="py-4 px-6 text-xs font-bold text-zinc-500 uppercase">สถานะ</th>
                  <th className="py-4 px-6 text-xs font-bold text-zinc-500 uppercase">วันที่สร้าง</th>
                  <th className="py-4 px-6 text-xs font-bold text-zinc-500 uppercase text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {isLoading ? (
                  <tr><td colSpan={4} className="py-8 text-center text-zinc-500">กำลังโหลด...</td></tr>
                ) : posts.length === 0 ? (
                  <tr><td colSpan={4} className="py-8 text-center text-zinc-500">ยังไม่มีบทความ</td></tr>
                ) : (
                  posts.map((post) => (
                    <tr key={post._id} className="border-b border-zinc-50 hover:bg-zinc-50/50">
                      <td className="py-4 px-6 font-bold text-zinc-900">{post.title}</td>
                      <td className="py-4 px-6">
                        {post.status === "PUBLISHED" ? (
                          <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">เผยแพร่แล้ว</span>
                        ) : post.status === "DRAFT" ? (
                          <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold">แบบร่าง</span>
                        ) : (
                          <span className="bg-zinc-100 text-zinc-700 px-3 py-1 rounded-full text-xs font-bold">เก็บถาวร</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-zinc-500">{new Date(post.createdAt).toLocaleDateString("th-TH")}</td>
                      <td className="py-4 px-6 text-right">
                        <Link href={`/admin/posts/${post._id}/edit`} className="inline-block px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-sm font-bold mr-2">
                          แก้ไข
                        </Link>
                        <button onClick={() => handleDelete(post._id)} className="inline-block px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-sm font-bold">
                          ลบ
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}