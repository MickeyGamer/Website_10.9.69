import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminPage() {
  const session = await auth();

  // เตะกลับไปหน้า Login ถ้ายังไม่เข้าระบบ
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col md:flex-row">
      
      {/* ---------------- Sidebar (เมนูด้านซ้าย) ---------------- */}
      <aside className="w-full md:w-64 bg-white border-r border-zinc-200 p-6 flex flex-col">
        <div className="mb-8 px-4">
          <h2 className="text-xl font-black text-zinc-900">ระบบหลังบ้าน</h2>
          <p className="text-xs text-zinc-500 mt-1">Admin Panel v1.0</p>
        </div>
        
        <nav className="flex flex-col gap-2">
          {/* เมนูที่ถูกเลือก (Active) */}
          <Link href="/admin" className="px-4 py-3 bg-zinc-100 text-zinc-900 rounded-xl font-bold text-sm flex items-center gap-3 transition">
            <span>📊</span> ภาพรวม (Dashboard)
          </Link>
          
          {/* เมนูอื่นๆ */}
          <Link href="#" className="px-4 py-3 text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 rounded-xl font-medium text-sm flex items-center gap-3 transition">
            <span>📝</span> จัดการกระทู้
          </Link>
          <Link href="#" className="px-4 py-3 text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 rounded-xl font-medium text-sm flex items-center gap-3 transition">
            <span>👥</span> จัดการสมาชิก
          </Link>
          <Link href="#" className="px-4 py-3 text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 rounded-xl font-medium text-sm flex items-center gap-3 transition">
            <span>⚙️</span> ตั้งค่าระบบ
          </Link>
        </nav>

        <div className="mt-auto pt-8">
          <Link href="/" className="px-4 py-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-bold text-sm transition w-full flex justify-center items-center gap-2">
            <span>🏠</span> กลับหน้าหลักเว็บ
          </Link>
        </div>
      </aside>


      {/* ---------------- Main Content (เนื้อหาฝั่งขวา) ---------------- */}
      <main className="flex-1 p-6 md:p-12">
        <div className="max-w-5xl mx-auto">
          
          <div className="mb-8">
            <h1 className="text-3xl font-black text-zinc-900 mb-2">ภาพรวมระบบ</h1>
            <p className="text-zinc-500">
              ยินดีต้อนรับกลับมาครับ <span className="font-bold text-zinc-900">{session.user.name}</span>
            </p>
          </div>

          {/* กล่องสถิติ 3 กล่อง */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm">
              <h3 className="text-zinc-500 text-sm font-medium mb-2">จำนวนสมาชิกทั้งหมด</h3>
              <p className="text-4xl font-black text-zinc-900">1,248</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm">
              <h3 className="text-zinc-500 text-sm font-medium mb-2">กระทู้ในระบบ</h3>
              <p className="text-4xl font-black text-zinc-900">342</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm">
              <h3 className="text-zinc-500 text-sm font-medium mb-2">สถานะเซิร์ฟเวอร์</h3>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                <p className="text-2xl font-black text-emerald-600">ปกติ (Online)</p>
              </div>
            </div>
          </div>

          {/* ตารางข้อมูลล่าสุด */}
          <div className="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-zinc-100">
              <h2 className="text-lg font-bold text-zinc-900">กิจกรรมล่าสุดในระบบ (จำลอง)</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50/50">
                    <th className="py-4 px-6 text-xs font-bold text-zinc-500 uppercase tracking-wider">วันเวลา</th>
                    <th className="py-4 px-6 text-xs font-bold text-zinc-500 uppercase tracking-wider">ผู้ใช้งาน</th>
                    <th className="py-4 px-6 text-xs font-bold text-zinc-500 uppercase tracking-wider">กิจกรรม</th>
                    <th className="py-4 px-6 text-xs font-bold text-zinc-500 uppercase tracking-wider">สถานะ</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  <tr className="border-b border-zinc-50 hover:bg-zinc-50/50 transition">
                    <td className="py-4 px-6 text-zinc-500">วันนี้, 10:30 น.</td>
                    <td className="py-4 px-6 font-bold text-zinc-900">{session.user.name}</td>
                    <td className="py-4 px-6 text-zinc-600">ตั้งกระทู้ใหม่ในหมวด "พูดคุยทั่วไป"</td>
                    <td className="py-4 px-6">
                      <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">สำเร็จ</span>
                    </td>
                  </tr>
                  <tr className="border-b border-zinc-50 hover:bg-zinc-50/50 transition">
                    <td className="py-4 px-6 text-zinc-500">วันนี้, 09:15 น.</td>
                    <td className="py-4 px-6 font-bold text-zinc-900">Mickey gamer</td>
                    <td className="py-4 px-6 text-zinc-600">เข้าสู่ระบบหลังบ้าน</td>
                    <td className="py-4 px-6">
                      <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold">สำเร็จ</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-zinc-50/50 transition">
                    <td className="py-4 px-6 text-zinc-500">เมื่อวาน, 22:00 น.</td>
                    <td className="py-4 px-6 font-bold text-zinc-900">Unknown</td>
                    <td className="py-4 px-6 text-zinc-600">พยายามเข้าสู่ระบบ (รหัสผ่านผิด)</td>
                    <td className="py-4 px-6">
                      <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">ล้มเหลว</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>

    </div>
  );
}