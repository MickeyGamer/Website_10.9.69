"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function ThreadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params); // แกะค่า id (Next.js 15)
  const { data: session } = useSession();
  const router = useRouter();

  const [thread, setThread] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // โหลดข้อมูลกระทู้และคอมเมนต์
  const fetchData = async () => {
    try {
      const [resThread, resComments] = await Promise.all([
        fetch(`/api/threads/${id}`),
        fetch(`/api/threads/${id}/comments`)
      ]);
      if (resThread.ok) setThread(await resThread.json());
      if (resComments.ok) setComments(await resComments.json());
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  // ฟังก์ชันส่งคอมเมนต์
  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/threads/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment }),
      });

      if (!res.ok) throw new Error("ส่งคอมเมนต์ไม่สำเร็จ");
      
      setNewComment(""); // ล้างกล่องข้อความ
      fetchData(); // โหลดคอมเมนต์ใหม่มาแสดงทันที
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-zinc-50">กำลังโหลดเนื้อหา...</div>;
  if (!thread) return <div className="min-h-screen flex items-center justify-center bg-zinc-50">ไม่พบกระทู้นี้ หรือถูกลบไปแล้ว</div>;

  return (
    <div className="min-h-screen bg-zinc-50 pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* ปุ่มกลับ */}
        <Link href="/board" className="text-zinc-500 hover:text-zinc-900 font-medium text-sm flex items-center gap-2 mb-6 transition">
          <span>←</span> กลับหน้าเว็บบอร์ด
        </Link>

        {/* เนื้อหากระทู้ */}
        <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-sm border border-zinc-100 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-black uppercase tracking-wider bg-blue-50 text-blue-600 px-3 py-1 rounded-lg">
              {thread.room}
            </span>
          </div>
          <h1 className="text-3xl font-black text-zinc-900 mb-6 leading-tight">{thread.title}</h1>
          
          <div className="flex items-center gap-3 pb-8 border-b border-zinc-100 mb-8">
            <div className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-500 font-bold">
              {thread.author?.name?.charAt(0) || "U"}
            </div>
            <div>
              <p className="text-sm font-bold text-zinc-900">{thread.author?.name || "ผู้ไม่ประสงค์ออกนาม"}</p>
              <p className="text-xs text-zinc-500">
                {new Date(thread.createdAt).toLocaleString("th-TH")} • ยอดวิว: {thread.views || 0}
              </p>
            </div>
          </div>

          <div className="prose max-w-none text-zinc-700 whitespace-pre-wrap leading-relaxed">
            {thread.content}
          </div>
        </div>

        {/* ส่วนแสดงคอมเมนต์ */}
        <div className="mb-8">
          <h3 className="text-xl font-black text-zinc-900 mb-6">คอมเมนต์ ({comments.length})</h3>
          
          <div className="space-y-4">
            {comments.map((comment, index) => (
              <div key={comment._id} className="bg-white p-6 rounded-2xl border border-zinc-100 shadow-[0_5px_15px_rgb(0,0,0,0.02)]">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-sm font-bold text-zinc-900">
                    #{index + 1} {comment.author?.name || "สมาชิก"}
                  </span>
                  <span className="text-xs text-zinc-400">
                    {new Date(comment.createdAt).toLocaleString("th-TH")}
                  </span>
                </div>
                <p className="text-zinc-700 whitespace-pre-wrap text-sm">{comment.content}</p>
              </div>
            ))}
            {comments.length === 0 && (
              <p className="text-zinc-500 text-center py-8 bg-zinc-100/50 rounded-2xl">ยังไม่มีคอมเมนต์ เป็นคนแรกที่แสดงความคิดเห็นสิ!</p>
            )}
          </div>
        </div>

        {/* ฟอร์มแสดงความคิดเห็น */}
        <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm">
          {session ? (
            <form onSubmit={handlePostComment}>
              <textarea 
                rows={4} required placeholder="แสดงความคิดเห็นของคุณ..."
                value={newComment} onChange={(e) => setNewComment(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-zinc-900 outline-none transition-all resize-y mb-4"
              />
              <div className="flex justify-end">
                <button 
                  type="submit" disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-xl transition-all disabled:opacity-70"
                >
                  {isSubmitting ? "กำลังส่ง..." : "ส่งคอมเมนต์"}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center py-6">
              <p className="text-zinc-500 mb-4">กรุณาเข้าสู่ระบบเพื่อแสดงความคิดเห็น</p>
              <button 
                onClick={() => router.push("/login")}
                className="bg-zinc-950 text-white font-bold py-2.5 px-6 rounded-xl transition-all"
              >
                เข้าสู่ระบบ
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}