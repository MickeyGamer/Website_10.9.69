"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import toast from "react-hot-toast"; // 1. นำเข้า toast

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State สำหรับจัดการ Popup ลบ
  const [postToDelete, setPostToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadPosts = async () => {
    try {
      const res = await fetch("/api/posts");
      const data: any = await res.json(); // เติม : any ดักไว้
      if (Array.isArray(data)) setPosts(data);
    } catch (error) {
      toast.error("โหลดข้อมูลบทความล้มเหลว"); // เปลี่ยนจาก console.error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleDelete = async () => {
    if (!postToDelete) return;
    setIsDeleting(true);
    const toastId = toast.loading("กำลังลบบทความ..."); // โชว์โหลดตอนกำลังลบ

    try {
      const res = await fetch(`/api/posts/${postToDelete._id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setPosts(posts.filter((p) => p._id !== postToDelete._id));
        setPostToDelete(null); // ปิด Popup
        toast.success("ลบบทความเรียบร้อย!", { id: toastId }); // แจ้งเตือนสำเร็จ
      } else {
        toast.error("ไม่สามารถลบบทความได้", { id: toastId }); // แจ้งเตือนล้มเหลว
      }
    } catch (error) {
      toast.error("ระบบขัดข้อง กรุณาลองใหม่", { id: toastId });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04)]">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">จัดการบทความ</h1>
          <p className="text-sm text-gray-500 mt-1">ทั้งหมด {posts.length} บทความในระบบ</p>
        </div>
        <Link 
          href="/admin/posts/new" 
          className="bg-gray-900 hover:bg-black text-white font-medium px-6 py-3 rounded-2xl transition shadow-lg hover:-translate-y-0.5"
        >
          + เขียนบทความใหม่
        </Link>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04)]">
        {loading ? (
          <div className="p-16 text-center text-gray-400 font-medium">กำลังโหลดข้อมูล...</div>
        ) : posts.length === 0 ? (
          <div className="p-16 text-center text-gray-400 font-medium">ยังไม่มีบทความ เริ่มสร้างบทความแรกของคุณเลย!</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/75 border-b border-gray-100 text-gray-400 uppercase tracking-wider text-xs">
                <tr>
                  <th className="p-6 font-bold">หัวข้อบทความ</th>
                  <th className="p-6 font-bold">สถานะ</th>
                  <th className="p-6 font-bold text-right">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {posts.map((post) => (
                  <tr key={post._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-6">
                      <p className="font-bold text-gray-900 text-base line-clamp-1">{post.title}</p>
                      <p className="text-gray-400 text-xs mt-1">/{post.slug}</p>
                    </td>
                    <td className="p-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold tracking-wide uppercase ${
                        post.status === "PUBLISHED" 
                          ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                          : "bg-gray-100 text-gray-500 border border-gray-200"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-2 ${post.status === "PUBLISHED" ? "bg-emerald-500" : "bg-gray-400"}`}></span>
                        {post.status}
                      </span>
                    </td>
                    <td className="p-6 text-right space-x-4">
                      <Link href={`/admin/posts/${post._id}/edit`} className="text-gray-600 hover:text-blue-600 font-semibold transition">
                        แก้ไข
                      </Link>
                      <button 
                        onClick={() => setPostToDelete(post)}
                        className="text-red-500 hover:text-red-700 font-semibold transition"
                      >
                        ลบ
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Popup Modal สำหรับยืนยันการลบ */}
      {postToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl border border-gray-100 transform transition-all">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center font-bold text-xl mb-6 mx-auto">
              ⚠️
            </div>
            <h3 className="text-xl font-black text-center text-gray-900 mb-2">ยืนยันการลบบทความ?</h3>
            <p className="text-gray-500 text-center text-sm mb-8 leading-relaxed">
              คุณต้องการลบบทความ <span className="font-bold text-gray-800">"{postToDelete.title}"</span> ใช่ไหม? การกระทำนี้ไม่สามารถกู้คืนได้
            </p>
            <div className="flex gap-3">
              <button 
                type="button"
                onClick={() => setPostToDelete(null)}
                disabled={isDeleting}
                className="flex-1 py-3 px-4 rounded-xl border border-gray-200 hover:bg-gray-50 font-semibold text-gray-700 transition"
              >
                ยกเลิก
              </button>
              <button 
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition shadow-lg shadow-red-600/20 disabled:opacity-50"
              >
                {isDeleting ? "กำลังลบ..." : "ลบทิ้งทันที"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}