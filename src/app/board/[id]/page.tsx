import { notFound } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import { Thread } from "@/models/Thread";
import { Comment } from "@/models/Comment";
import Link from "next/link";
import CommentBox from "./CommentBox";

export const dynamic = "force-dynamic";

interface ThreadPageProps {
  params: Promise<{ id: string }>;
}

export default async function ThreadPage({ params }: ThreadPageProps) {
  const { id } = await params;
  await connectDB();

  // 1. ดึงข้อมูลกระทู้ พร้อมบวกยอดคนดู (views) อัตโนมัติ
  const thread = await Thread.findByIdAndUpdate(
    id, 
    { $inc: { views: 1 } }, 
    { new: true }
  ).populate("author", "name").lean();

  if (!thread) notFound();

  // 2. ดึงคอมเมนต์ทั้งหมดของกระทู้นี้ เรียงตามเวลา
  const comments = await Comment.find({ thread: id })
    .populate("author", "name")
    .sort({ createdAt: 1 })
    .lean();

  const typedThread = thread as any;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* ปุ่มย้อนกลับ */}
      <Link href="/board" className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-900 mb-8 transition">
        ← กลับไปหน้าเว็บบอร์ด
      </Link>

      {/* เนื้อหากระทู้หลัก */}
      <div className="bg-white rounded-3xl p-8 md:p-10 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04)] border border-zinc-100 mb-10">
        <h1 className="text-2xl md:text-4xl font-black text-zinc-900 mb-6 leading-tight">
          {typedThread.title}
        </h1>
        
        <div className="flex items-center gap-3 mb-8 pb-8 border-b border-zinc-100">
          <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-white font-bold shadow-sm">
            {typedThread.author?.name?.charAt(0) || "U"}
          </div>
          <div>
            <p className="font-bold text-zinc-900 text-sm">{typedThread.author?.name || "สมาชิกทั่วไป"}</p>
            <div className="flex items-center gap-2 text-xs text-zinc-500 mt-0.5">
              <span>{new Date(typedThread.createdAt).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })}</span>
              <span>•</span>
              <span>👁️ {typedThread.views} ครั้ง</span>
            </div>
          </div>
        </div>

        {/* เรนเดอร์ HTML ด้วย Tailwind Prose */}
        <div 
          className="prose prose-zinc prose-lg max-w-none prose-img:rounded-2xl"
          dangerouslySetInnerHTML={{ __html: typedThread.content }}
        />
      </div>

      {/* พื้นที่คอมเมนต์ */}
      <div className="space-y-6 mb-12">
        <h3 className="text-lg font-black text-zinc-900 px-2">ความคิดเห็น ({comments.length})</h3>
        
        {comments.map((comment: any, index: number) => (
          <div key={comment._id.toString()} className="bg-white p-6 rounded-3xl shadow-sm border border-zinc-100 flex gap-4">
            <div className="w-10 h-10 shrink-0 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 font-bold border border-zinc-200">
              {comment.author?.name?.charAt(0) || "?"}
            </div>
            <div className="flex-grow">
              <div className="flex items-baseline justify-between mb-2">
                <span className="font-bold text-zinc-900 text-sm">{comment.author?.name || "สมาชิก"}</span>
                <span className="text-xs text-zinc-400 font-medium">
                  ความคิดเห็นที่ {index + 1} • {new Date(comment.createdAt).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })}
                </span>
              </div>
              <div 
                className="prose prose-sm max-w-none text-zinc-700"
                dangerouslySetInnerHTML={{ __html: comment.content }}
              />
            </div>
          </div>
        ))}

        {comments.length === 0 && (
          <div className="text-center py-12 bg-zinc-50/50 rounded-3xl border border-dashed border-zinc-200">
            <p className="text-zinc-500 font-medium">ยังไม่มีความคิดเห็น เป็นคนแรกที่คอมเมนต์สิ!</p>
          </div>
        )}
      </div>

      {/* กล่องพิมพ์คอมเมนต์ (Client Component) */}
      <CommentBox threadId={id} />
    </div>
  );
}