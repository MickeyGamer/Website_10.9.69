import Link from "next/link";
import { auth } from "@/auth";

export default async function Navbar() {
  const session = await auth();

  return (
    <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-2xl font-black text-blue-600 tracking-tighter">
          Mickey<span className="text-gray-900">Blog.</span>
        </Link>

        <div className="flex items-center space-x-6 text-sm font-medium text-gray-600">
          <Link href="/blog" className="hover:text-gray-900 transition">บทความทั้งหมด</Link>
          
          {session ? (
            <div className="flex items-center space-x-4">
              <span className="hidden sm:block">สวัสดี, {session.user?.name || "User"}</span>
              
              {/* จุดที่แก้บั๊ก: ใส่ (session.user as any) เพื่อบอกให้ TypeScript ยอมรับฟิลด์ role */}
              {(session.user as any)?.role === "ADMIN" && (
                <Link href="/admin" className="text-blue-600 hover:underline">จัดการหลังบ้าน</Link>
              )}
              
              <Link href="/api/auth/signout" className="bg-gray-100 hover:bg-gray-200 text-gray-900 px-4 py-2 rounded-full transition">
                ออกระบบ
              </Link>
            </div>
          ) : (
            <Link href="/login" className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-2 rounded-full transition shadow-md">
              เข้าสู่ระบบ
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}