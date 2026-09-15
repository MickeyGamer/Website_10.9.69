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
    <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
      {/* แถบเมนูด้านข้าง (Sidebar) */}
      <aside className="w-full md:w-64 shrink-0">
        <div className="bg-white rounded-2xl shadow-sm border p-4 sticky top-24">
          <h2 className="font-bold text-lg mb-4 px-4 text-gray-800">เมนูจัดการ</h2>
          <nav className="flex flex-col space-y-1">
            <Link href="/admin" className="px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700 font-medium transition">
              ภาพรวม (Dashboard)
            </Link>
            <Link href="/admin/posts" className="px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700 font-medium transition">
              จัดการบทความ
            </Link>
            <Link href="/admin/categories" className="px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-700 font-medium transition">
              จัดการหมวดหมู่
            </Link>
          </nav>
        </div>
      </aside>

      {/* พื้นที่แสดงเนื้อหา */}
      <main className="flex-grow">
        <div className="bg-white rounded-2xl shadow-sm border p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}