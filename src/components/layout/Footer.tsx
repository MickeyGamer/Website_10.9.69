import Link from "next/link";

const menuLinks = [
  {
    label: "หน้าแรก",
    href: "/",
  },
  {
    label: "บทความ",
    href: "/blog",
  },
  {
    label: "เว็บบอร์ด",
    href: "/board",
  },
  {
    label: "ร้านค้า",
    href: "/shop",
  },
  {
    label: "ทีมงาน",
    href: "/team",
  },
];

const shopLinks = [
  {
    label: "สินค้าทั้งหมด",
    href: "/shop",
  },
  {
    label: "ตะกร้าสินค้า",
    href: "/cart",
  },
  {
    label: "คำสั่งซื้อของฉัน",
    href: "/orders",
  },
];

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-zinc-200 bg-zinc-950 text-zinc-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

        {/* =================================
            Main Footer
        ================================= */}

        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}

          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-3"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-lg font-bold text-black">
                M
              </span>

              <span className="text-xl font-bold text-white">
                MickeyHub
              </span>
            </Link>

            <p className="mt-4 max-w-sm text-sm leading-6 text-zinc-400">
              แพลตฟอร์มสำหรับบทความ เว็บบอร์ด
              ร้านค้า และพื้นที่สำหรับชุมชน
              MickeyHub
            </p>
          </div>

          {/* Website */}

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-white">
              เว็บไซต์
            </h2>

            <ul className="mt-4 space-y-3">
              {menuLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-zinc-400 transition hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Shop */}

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-white">
              ร้านค้า
            </h2>

            <ul className="mt-4 space-y-3">
              {shopLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-zinc-400 transition hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-white">
              ติดต่อเรา
            </h2>

            <div className="mt-4 space-y-3 text-sm text-zinc-400">
              <p>
                📧 Email
              </p>

              <p>
                💬 Community
              </p>

              <p>
                🛟 ศูนย์ช่วยเหลือ
              </p>
            </div>
          </div>
        </div>

        {/* =================================
            Divider
        ================================= */}

        <div className="my-10 border-t border-zinc-800" />

        {/* =================================
            Bottom Footer
        ================================= */}

        <div className="flex flex-col gap-4 text-sm sm:flex-row sm:items-center sm:justify-between">

          <p className="text-zinc-500">
            © {new Date().getFullYear()} MickeyHub.
            All rights reserved.
          </p>

          <div className="flex gap-5">
            <Link
              href="/"
              className="text-zinc-500 transition hover:text-white"
            >
              นโยบายความเป็นส่วนตัว
            </Link>

            <Link
              href="/"
              className="text-zinc-500 transition hover:text-white"
            >
              เงื่อนไขการใช้งาน
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}