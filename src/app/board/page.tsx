import Link from "next/link";
import { connectDB } from "@/lib/mongodb";
import { Thread } from "@/models/Thread";

export const dynamic = "force-dynamic";

export default async function BoardPage() {
  await connectDB();
  const threads = await Thread.find().populate("author", "name").sort({ createdAt: -1 }).lean();

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 md:py-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Community Board</h1>
          <p className="text-gray-500 mt-2">พื้นที่พูดคุย แลกเปลี่ยนความรู้ และถาม-ตอบ (สไตล์พันทิป)</p>
        </div>
        <Link 
          href="/board/new" 
          className="bg-zinc-950 hover:bg-zinc-800 text-white font-medium px-6 py-3 rounded-xl transition shadow-lg shadow-zinc-900/20 active:scale-[0.98]"
        >
          + ตั้งกระทู้ใหม่
        </Link>
      </div>

      <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        {/* หัวตาราง (ซ่อนในมือถือ) */}
        <div className="hidden md:grid grid-cols-12 gap-4 p-5 bg-gray-50/80 border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
          <div className="col-span-8">หัวข้อกระทู้</div>
          <div className="col-span-2 text-center">ผู้ตั้งกระทู้</div>
          <div className="col-span-2 text-center">อ่าน / ตอบ</div>
        </div>

        {/* รายการกระทู้ */}
        <div className="divide-y divide-gray-100">
          {threads.length === 0 ? (
            <div className="p-16 text-center text-gray-400 font-medium">ยังไม่มีกระทู้ เริ่มตั้งกระทู้แรกกันเลย!</div>
          ) : (
            threads.map((thread: any) => (
              <Link 
                href={`/board/${thread._id}`} 
                key={thread._id.toString()}
                className="block p-5 hover:bg-gray-50/50 transition-colors group"
              >
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  <div className="col-span-1 md:col-span-8">
                    <h2 className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {thread.title}
                    </h2>
                    <div className="flex items-center gap-2 mt-1.5 md:hidden">
                      <span className="text-xs text-gray-500">{thread.author?.name || "สมาชิก"}</span>
                      <span className="text-gray-300">•</span>
                      <span className="text-xs text-gray-400">{new Date(thread.createdAt).toLocaleDateString('th-TH')}</span>
                    </div>
                  </div>
                  
                  <div className="hidden md:block col-span-2 text-center">
                    <span className="inline-flex items-center px-3 py-1 bg-gray-100 rounded-full text-xs font-semibold text-gray-600">
                      {thread.author?.name || "สมาชิก"}
                    </span>
                  </div>
                  
                  <div className="hidden md:flex col-span-2 justify-center items-center gap-4 text-xs font-medium text-gray-400">
                    <div className="flex flex-col items-center">
                      <span className="text-gray-900 font-bold">{thread.views || 0}</span>
                      <span className="text-[10px] uppercase tracking-wider">Views</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-gray-900 font-bold">{thread.repliesCount || 0}</span>
                      <span className="text-[10px] uppercase tracking-wider">Replies</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}