import Link from "next/link";

export default function Home() {
  // จำลองข้อมูลบทความไปก่อน (Mock Data) 
  const mockPosts = [
    { id: 1, title: 'เรียนรู้ Next.js App Router ภายใน 10 นาที', category: 'Technology' },
    { id: 2, title: 'เทคนิคการจัดหน้าเว็บด้วย Tailwind CSS ให้เป๊ะปัง', category: 'Design' },
    { id: 3, title: 'การทำงานกับ MongoDB ในโปรเจกต์ยุคใหม่', category: 'Database' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-20">
      
      {/* Hero Section */}
      <section className="text-center py-24 px-6 bg-gradient-to-br from-blue-50 via-white to-indigo-50 rounded-[2.5rem] border border-blue-100/50 shadow-sm mt-4 relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 text-gray-900 leading-tight">
            ยินดีต้อนรับสู่ <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Mickey Blog</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            พื้นที่แบ่งปันความรู้ เทคนิคการเขียนโค้ด ประสบการณ์ด้านไอที และเรื่องราวไลฟ์สไตล์ที่คุณไม่ควรพลาด
          </p>
          <Link href="/blog" className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-semibold text-lg transition shadow-lg hover:shadow-blue-600/30 hover:-translate-y-1">
            อ่านบทความทั้งหมด
          </Link>
        </div>
      </section>

      {/* Recent Posts */}
      <section>
        <div className="flex justify-between items-end mb-8 border-b pb-4">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">บทความล่าสุด</h2>
          <Link href="/blog" className="text-blue-600 font-medium hover:underline mb-1">ดูทั้งหมด &rarr;</Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {mockPosts.map((post) => (
            <Link href={`/blog/${post.id}`} key={post.id} className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="aspect-[4/3] bg-gray-200 relative overflow-hidden">
                {/* สีพื้นหลังจำลองแทนรูปภาพ */}
                <div className="absolute inset-0 bg-gradient-to-tr from-gray-200 to-gray-50 group-hover:scale-105 transition duration-700 ease-in-out"></div>
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-blue-600 uppercase tracking-wider shadow-sm">
                  {post.category}
                </div>
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-blue-600 transition line-clamp-2 leading-snug">
                  {post.title}
                </h3>
                <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                  นี่คือเนื้อหาตัวอย่างแบบย่อของบทความ เพื่อให้ผู้อ่านเห็นภาพรวมก่อนคลิกเข้าไปอ่านแบบเต็มๆ ด้านใน...
                </p>
                <div className="text-sm font-medium text-gray-400 mt-auto pt-4 border-t border-gray-50">
                  10 กันยายน 2026
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
}