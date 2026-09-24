"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavLinks() {
  const pathname = usePathname();

  const menuClass = (path: string) =>
    `rounded-lg px-3 py-2 transition-colors ${
      pathname === path
        ? "bg-blue-100 text-blue-700"
        : "text-gray-500 hover:text-zinc-900"
    }`;

  return (
    <div className="hidden items-center space-x-4 text-sm font-medium md:flex">
      <Link href="/blog" className={menuClass("/blog")}>
        บทความ
      </Link>

      <Link href="/board" className={menuClass("/board")}>
        เว็บบอร์ด
      </Link>

      <Link href="/shop" className={menuClass("/shop")}>
        ร้านค้า
      </Link>

      <Link href="/team" className={menuClass("/team")}>
        ทีมงาน
      </Link>
    </div>
  );
}