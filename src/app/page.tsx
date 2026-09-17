import Link from "next/link";
import { connectDB } from "@/lib/mongodb";
import { Post } from "@/models/Post";
import { Product } from "@/models/Product";
import { Thread } from "@/models/Thread";
import TypewriterEffect from "@/components/TypewriterEffect";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  await connectDB();

  const latestPosts = await Post.find({ status: "PUBLISHED" })
    .populate("category", "name")
    .sort({ createdAt: -1 })
    .limit(3)
    .lean();

  const latestProducts = await Product.find({ isActive: true })
    .sort({ createdAt: -1 })
    .limit(3)
    .lean();

  const latestThreads = await Thread.find()
    .populate("author", "name")
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  // ชุดสโลแกนใหม่สุดเท่ของคุณ (พิมพ์วนลูป)
  const slogans = [
    "ทุกอย่างครบจบในที่เดียว",
    "สติมาโปรแกรมเกิด สติเตลิด Error กระจาย",
    "Read. Shop. Connect. (จบในที่เดียว)",
    "Tech, Lifestyle, และ สินค้าพรีเมียม.",
    "Connecting Ideas, Empowering Community."
  ];

  return (
    <div className="space-y-24 pb-24">
      {/* 🚀 Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden flex flex-col items-center text-center px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-50 to-white -z-10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-3xl -z-10" />
        
        {/* เปลี่ยนป้ายเป็น MickeyHub */}
        <span className="px-4 py-1.5 rounded-full bg-zinc-100 text-zinc-600 text-xs font-bold uppercase tracking-widest mb-6 border border-zinc-200 shadow-sm">
          Welcome to MickeyHub
        </span>
        
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-zinc-900 tracking-tight leading-tight max-w-5xl mb-6 min-h-[120px] md:min-h-[160px] flex items-center justify-center">
          <TypewriterEffect words={slogans} />
        </h1>
        
        <p className="text-lg text-zinc-500 max-w-2xl mb-10 leading-relaxed font-medium">
          สัมผัสประสบการณ์ใหม่ในการอ่านบทความ ช้อปปิ้งสินค้าพรีเมียม และร่วมพูดคุยในคอมมูนิตี้ ครบจบในแอปเดียว
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/shop" className="bg-zinc-950 hover:bg-zinc-800 text-white font-medium px-8 py-4 rounded-2xl transition shadow-lg shadow-zinc-900/20 active:scale-[0.98]">
            เริ่มช้อปปิ้งเลย
          </Link>
          <Link href="/board" className="bg-white border border-zinc-200 text-zinc-900 hover:border-zinc-900 font-medium px-8 py-4 rounded-2xl transition active:scale-[0.98] shadow-sm">
            เข้าร่วมคอมมูนิตี้
          </Link>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 space-y-32">
        {/* 🛍️ Section 1: Latest Products */}
        <section>
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-black text-zinc-900 tracking-tight">สินค้ามาใหม่</h2>
              <p className="text-zinc-500 mt-2">ไอเทมพรีเมียมล่าสุดจากร้านค้าของเรา</p>
            </div>
            <Link href="/shop" className="text-sm font-bold text-zinc-900 hover:text-blue-600 transition flex items-center gap-1">
              ดูทั้งหมด <span>→</span>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {latestProducts.map((product: any) => (
              <Link href="/shop" key={product._id.toString()} className="group flex flex-col bg-white rounded-3xl overflow-hidden shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04)] hover:shadow-xl transition-all duration-300 border border-zinc-100">
                <div className="aspect-[4/5] bg-zinc-50 relative overflow-hidden flex items-center justify-center">
                  {product.images?.[0] ? (
                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                  ) : (
                    <span className="text-zinc-400 font-medium">ไม่มีรูปภาพ</span>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold text-zinc-900 mb-2">{product.name}</h3>
                  <p className="text-2xl font-black text-zinc-900">฿{product.price.toLocaleString()}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 📝 Section 2: Latest Blog Posts */}
        <section>
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-black text-zinc-900 tracking-tight">บทความล่าสุด</h2>
              <p className="text-zinc-500 mt-2">อัปเดตเรื่องราวและความรู้ใหม่ๆ</p>
            </div>
            <Link href="/blog" className="text-sm font-bold text-zinc-900 hover:text-blue-600 transition flex items-center gap-1">
              อ่านทั้งหมด <span>→</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {latestPosts.map((post: any) => (
              <Link href={`/blog/${post.slug}`} key={post._id.toString()} className="group">
                <div className="aspect-video w-full rounded-3xl mb-4 overflow-hidden border border-zinc-100 shadow-sm bg-zinc-50">
                  {post.coverImage && (
                    <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                  )}
                </div>
                {post.category && (
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2 block">
                    {post.category.name}
                  </span>
                )}
                <h3 className="text-xl font-bold text-zinc-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-zinc-500 text-sm line-clamp-2">{post.excerpt}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* 💬 Section 3: Active Threads */}
        <section>
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <h2 className="text-3xl font-black text-zinc-900 tracking-tight">คอมมูนิตี้</h2>
              <p className="text-zinc-500 mt-2">กระทู้พูดคุยล่าสุดจากสมาชิก</p>
            </div>
            <Link href="/board/new" className="bg-zinc-900 hover:bg-zinc-800 text-white font-medium px-5 py-2.5 rounded-xl transition text-sm shadow-sm">
              + ตั้งกระทู้ใหม่
            </Link>
          </div>

          <div className="bg-white border border-zinc-100 rounded-3xl overflow-hidden shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04)] divide-y divide-zinc-100">
            {latestThreads.map((thread: any) => (
              <Link href={`/board/${thread._id}`} key={thread._id.toString()} className="block p-6 hover:bg-zinc-50/50 transition-colors group">
                <div className="flex justify-between items-center gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-zinc-900 group-hover:text-blue-600 transition-colors mb-1 line-clamp-1">
                      {thread.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <span className="font-semibold">{thread.author?.name || "สมาชิก"}</span>
                      <span>•</span>
                      <span>{new Date(thread.createdAt).toLocaleDateString('th-TH')}</span>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-4 text-xs font-bold text-zinc-400">
                    <span className="flex items-center gap-1">👁️ {thread.views || 0}</span>
                    <span className="flex items-center gap-1">💬 {thread.repliesCount || 0}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link href="/board" className="text-sm font-bold text-zinc-900 hover:text-blue-600 transition inline-flex items-center gap-1">
              ดูกระทู้ทั้งหมด <span>→</span>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}