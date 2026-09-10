import Link from "next/link";
import { connectDB } from "@/lib/mongodb";
import { Post } from "@/models/Post";

// ตั้งค่าให้ระบบอัปเดตหน้าเว็บทุกๆ 60 วินาที (ISR)
export const revalidate = 60;

export default async function BlogPage() {
  await connectDB();
  
  // ดึงเฉพาะบทความที่เผยแพร่แล้ว เรียงจากใหม่ไปเก่า
  const posts = await Post.find({ status: "PUBLISHED" })
    .populate("category") // ดึงข้อมูลหมวดหมู่มาด้วย (ถ้ามี)
    .sort({ createdAt: -1 })
    .lean();

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <header className="mb-16 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
          บทความทั้งหมด
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
          อัปเดตความรู้ เทคนิคใหม่ๆ และเรื่องราวที่น่าสนใจที่เราคัดสรรมาเพื่อคุณ
        </p>
      </header>

      {posts.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
          <p className="text-gray-500 text-lg">ยังไม่มีบทความในขณะนี้ แวะมาใหม่น้า 🚀</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {posts.map((post: any) => (
            <Link 
              href={`/blog/${post.slug}`} 
              key={post._id.toString()}
              className="group flex flex-col bg-white rounded-3xl overflow-hidden shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-1.5 border border-gray-100"
            >
              {/* ภาพปก */}
              <div className="aspect-[16/10] bg-gray-100 relative overflow-hidden">
                {post.coverImage ? (
                  <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out" />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-indigo-50 group-hover:scale-105 transition-transform duration-700"></div>
                )}
                {/* Tag หมวดหมู่ */}
                {post.category && (
                  <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold text-blue-600 shadow-sm">
                    {post.category.name}
                  </div>
                )}
              </div>
              
              {/* เนื้อหา Card */}
              <div className="p-6 md:p-8 flex flex-col flex-grow">
                <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 mb-3 line-clamp-2 leading-snug">
                  {post.title}
                </h2>
                <p className="text-gray-500 text-sm mb-6 line-clamp-3 leading-relaxed">
                  {post.excerpt || "คลิกเพื่ออ่านเนื้อหาฉบับเต็ม..."}
                </p>
                <div className="mt-auto flex items-center justify-between text-xs font-medium text-gray-400">
                  <time>{new Date(post.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}</time>
                  <span className="flex items-center text-blue-600 group-hover:translate-x-1 transition-transform">
                    อ่านต่อ <span className="ml-1">→</span>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}