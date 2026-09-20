import Link from "next/link";
import { auth } from "@/auth";

export default async function Navbar() {
  const session = await auth();

  return (
    <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50 transition-all">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* โลโก้เว็บไซต์ */}
        <div className="flex items-center space-x-8">
          <Link href="/" className="text-xl font-black text-zinc-900 tracking-tight hover:opacity-80 transition">
            Mickey<span className="text-blue-600">Hub.</span>
          </Link>

          {/* เมนูหลักนำทาง */}
          <div className="hidden md:flex items-center space-x-6 text-sm font-medium text-gray-500">
            <Link 
              href="/blog" 
              className="hover:text-zinc-900 transition-colors"
            >
              บทความ
            </Link>

            <Link 
              href="/board" 
              className="hover:text-zinc-900 transition-colors"
            >
              เว็บบอร์ด
            </Link>

            <Link 
              href="/shop" 
              className="hover:text-zinc-900 transition-colors flex items-center gap-1.5"
            >
              <span>ร้านค้า</span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
            </Link>

            {/* เมนูทีมงาน เพิ่มเข้ามาเท่านั้น */}
            <Link 
              href="/team" 
              className="hover:text-zinc-900 transition-colors"
            >
              ทีมงาน
            </Link>
          </div>
        </div>

        {/* ส่วนจัดการผู้ใช้ / ล็อกอิน */}
        <div className="flex items-center space-x-4 text-sm font-medium">
          {session?.user ? (
            <div className="flex items-center space-x-4">
              <span className="hidden sm:inline-block text-gray-600">
                {session.user.name || "สมาชิก"}
              </span>

              {/* แสดงเฉพาะผู้ใช้ที่มี Role ADMIN */}
              {(session.user as any)?.role === "ADMIN" && (
                <Link 
                  href="/admin" 
                  className="text-xs font-semibold px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"
                >
                  หลังบ้าน (Admin)
                </Link>
              )}

              <Link 
                href="/api/auth/signout" 
                className="text-xs font-medium text-gray-500 hover:text-red-600 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-red-200 transition"
              >
                ออกจากระบบ
              </Link>
            </div>
          ) : (
            <Link 
              href="/login" 
              className="bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-medium px-4 py-2 rounded-xl transition shadow-sm active:scale-[0.98]"
            >
              เข้าสู่ระบบ
            </Link>
          )}
        </div>

      </div>
    </nav>
  );
}