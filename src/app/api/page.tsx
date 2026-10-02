import Link from "next/link";

const menus = [
  {
    title: "บทความ",
    description: "จัดการบทความทั้งหมด",
    href: "/admin/articles",
    icon: "📝",
  },
  {
    title: "สินค้า",
    description: "เพิ่ม แก้ไข และจัดการสินค้า",
    href: "/admin/products",
    icon: "🛒",
  },
  {
    title: "คำสั่งซื้อ",
    description: "ตรวจสอบและจัดการ Orders",
    href: "/admin/orders",
    icon: "📦",
  },
  {
    title: "หมวดหมู่",
    description: "จัดการหมวดหมู่",
    href: "/admin/categories",
    icon: "🗂️",
  },
  {
    title: "ผู้ใช้งาน",
    description: "จัดการสมาชิกในระบบ",
    href: "/admin/users",
    icon: "👥",
  },
];

export default function AdminDashboardPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-7xl">

        <div className="mb-8">
          <p className="text-sm font-bold text-blue-600">
            ADMIN PANEL
          </p>

          <h1 className="mt-1 text-3xl font-black text-gray-900">
            Dashboard
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            จัดการระบบ MickeyHub
          </p>
        </div>

        {/* Statistics */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border bg-white p-5">
            <p className="text-sm text-gray-500">
              ผู้ใช้งาน
            </p>
            <p className="mt-2 text-3xl font-black">
              -
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-5">
            <p className="text-sm text-gray-500">
              บทความ
            </p>
            <p className="mt-2 text-3xl font-black">
              -
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-5">
            <p className="text-sm text-gray-500">
              สินค้า
            </p>
            <p className="mt-2 text-3xl font-black">
              -
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-5">
            <p className="text-sm text-gray-500">
              Orders
            </p>
            <p className="mt-2 text-3xl font-black">
              -
            </p>
          </div>
        </div>

        {/* Menu */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {menus.map((menu) => (
            <Link
              key={menu.href}
              href={menu.href}
              className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
            >
              <div className="text-3xl">
                {menu.icon}
              </div>

              <h2 className="mt-4 text-xl font-bold">
                {menu.title}
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                {menu.description}
              </p>

              <div className="mt-5 text-sm font-bold text-blue-600">
                จัดการ →
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}