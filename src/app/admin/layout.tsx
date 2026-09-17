import { redirect } from "next/navigation";
import { auth } from "@/auth";
import Link from "next/link";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  
  // ป้องกันคนที่ไม่ใช่ Admin แอบเข้าหน้านี้
  if ((session?.user as any)?.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col md:flex-row gap-8">
      {/* แถบเมนูด้านข้าง (Sidebar) */}
      <aside className="w-full md:w-64 shrink-0">
        <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-100 p-6 sticky top-24">
          <h2 className="font-black text-lg mb-6 px-2 text-zinc-900 tracking-tight">ระบบหลังบ้าน</h2>
          <nav className="flex flex-col space-y-1.5">
            <Link href="/admin" className="px-4 py-3 rounded-2xl hover:bg-zinc-50 text-zinc-600 hover:text-zinc-950 font-semibold transition-all flex items-center gap-3">
              <span>📊</span>
              <span>ภาพรวม (Dashboard)</span>
            </Link>
            
            <div className="h-px bg-zinc-100 my-4 mx-4"></div>
            
            <Link href="/admin/posts" className="px-4 py-3 rounded-2xl hover:bg-zinc-50 text-zinc-600 hover:text-zinc-950 font-semibold transition-all flex items-center gap-3">
              <span>📝</span>
              <span>จัดการบทความ</span>
            </Link>
            <Link href="/admin/categories" className="px-4 py-3 rounded-2xl hover:bg-zinc-50 text-zinc-600 hover:text-zinc-950 font-semibold transition-all flex items-center gap-3">
              <span>🏷️</span>
              <span>จัดการหมวดหมู่</span>
            </Link>
            
            <div className="h-px bg-zinc-100 my-4 mx-4"></div>
            
            <Link href="/admin/products" className="px-4 py-3 rounded-2xl hover:bg-zinc-50 text-zinc-600 hover:text-zinc-950 font-semibold transition-all flex items-center gap-3">
              <span>🛍️</span>
              <span>สินค้าในร้าน</span>
            </Link>
            <Link href="/admin/orders" className="px-4 py-3 rounded-2xl hover:bg-zinc-50 text-zinc-600 hover:text-zinc-950 font-semibold transition-all flex items-center gap-3">
              <span>📦</span>
              <span>คำสั่งซื้อ (Orders)</span>
            </Link>
          </nav>
        </div>
      </aside>

      {/* พื้นที่แสดงเนื้อหา */}
      <main className="flex-grow">
        {/* ลบกล่องสีขาวหุ้มเนื้อหาออก เพื่อให้แต่ละหน้า (page) จัดการความกว้างและพื้นหลังของตัวเองได้อิสระขึ้น */}
        <div className="min-h-[60vh]">
          {children}
        </div>
      </main>
    </div>
  );
}