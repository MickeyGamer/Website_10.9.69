import { connectDB } from "@/lib/mongodb";
import { Post } from "@/models/Post";
import { User } from "@/models/User";
import { Category } from "@/models/Category";
import Link from "next/link";

// บังคับให้โหลดข้อมูลใหม่เสมอ (ไม่จำ Cache)
export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  await connectDB();
  
  // นับข้อมูลจากฐานข้อมูลจริงๆ (ทำขนานกันเพื่อความรวดเร็ว)
  const [postCount, userCount, categoryCount, latestPosts] = await Promise.all([
    Post.countDocuments(),
    User.countDocuments(),
    Category.countDocuments(),
    Post.find().sort({ createdAt: -1 }).limit(3).lean() // ดึงบทความล่าสุด 3 อัน
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">ภาพรวมระบบ (Dashboard)</h1>
        <p className="text-sm text-gray-500 mt-1">สรุปข้อมูลทั้งหมดภายในบล็อกของคุณ</p>
      </div>
      
      {/* การ์ดสถิติจริง */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04)] hover:shadow-md transition">
          <h3 className="text-gray-500 font-medium text-sm mb-2">บทความทั้งหมด</h3>
          <p className="text-4xl font-black text-zinc-900">{postCount}</p>
        </div>
        <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04)] hover:shadow-md transition">
          <h3 className="text-gray-500 font-medium text-sm mb-2">หมวดหมู่ทั้งหมด</h3>
          <p className="text-4xl font-black text-zinc-900">{categoryCount}</p>
        </div>
        <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04)] hover:shadow-md transition">
          <h3 className="text-gray-500 font-medium text-sm mb-2">จำนวนผู้ใช้งาน</h3>
          <p className="text-4xl font-black text-zinc-900">{userCount}</p>
        </div>
      </div>

      {/* Widget บทความล่าสุด */}
      <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04)] p-6 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-lg text-gray-900">บทความล่าสุด</h3>
          <Link href="/admin/posts" className="text-sm font-medium text-blue-600 hover:underline">
            ดูทั้งหมด
          </Link>
        </div>
        
        {latestPosts.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-gray-500 text-sm">
            ยังไม่มีบทความในระบบ
          </div>
        ) : (
          <div className="space-y-4">
            {latestPosts.map((post: any) => (
              <div key={post._id.toString()} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <div>
                  <p className="font-bold text-sm text-gray-900 line-clamp-1">{post.title}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(post.createdAt).toLocaleDateString('th-TH')} • สถานะ: {post.status}
                  </p>
                </div>
                <Link href={`/admin/posts/${post._id}/edit`} className="text-sm font-semibold text-gray-600 hover:text-zinc-900 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 transition">
                  แก้ไข
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}