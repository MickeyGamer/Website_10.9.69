"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut, useSession } from "next-auth/react";

const publicMenu = [
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

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const [open, setOpen] = useState(false);

  const isLoading = status === "loading";
  const isLoggedIn = status === "authenticated";

  const closeMenu = () => {
    setOpen(false);
  };

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const handleLogout = async () => {
    closeMenu();

    await signOut({
      callbackUrl: "/",
    });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/95 backdrop-blur">
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8"
        aria-label="เมนูหลัก"
      >
        {/* =========================
            Logo
        ========================= */}

        <Link
          href="/"
          onClick={closeMenu}
          className="flex items-center gap-2 rounded-xl px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2"
          aria-label="MickeyHub หน้าแรก"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-black text-lg text-white">
            M
          </span>

          <span className="text-lg font-bold tracking-tight text-zinc-900">
            MickeyHub
          </span>
        </Link>

        {/* =========================
            Desktop Menu
        ========================= */}

        <div className="hidden items-center gap-1 md:flex">
          {publicMenu.map((item) => {
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                }`}
              >
                {item.label}
              </Link>
            );
          })}

          {/* Cart */}

          <Link
            href="/cart"
            className={`ml-1 rounded-xl px-4 py-2 text-sm font-medium transition ${
              isActive("/cart")
                ? "bg-zinc-900 text-white"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
            }`}
          >
            🛒 ตะกร้า
          </Link>
        </div>

        {/* =========================
            Desktop User Menu
        ========================= */}

        <div className="hidden items-center gap-2 md:flex">
          {isLoading ? (
            <div className="h-9 w-24 animate-pulse rounded-xl bg-zinc-100" />
          ) : isLoggedIn ? (
            <>
              <Link
                href="/orders"
                className="rounded-xl px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900"
              >
                📦 คำสั่งซื้อ
              </Link>

              <span className="max-w-32 truncate px-2 text-sm text-zinc-600">
                {session?.user?.name || "สมาชิก"}
              </span>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded-xl border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-100"
              >
                ออกจากระบบ
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-xl px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100"
              >
                เข้าสู่ระบบ
              </Link>

              <Link
                href="/register"
                className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800"
              >
                สมัครสมาชิก
              </Link>
            </>
          )}
        </div>

        {/* =========================
            Mobile Button
        ========================= */}

        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-300 text-xl text-zinc-800 md:hidden"
          aria-label={open ? "ปิดเมนู" : "เปิดเมนู"}
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
          {open ? "×" : "☰"}
        </button>
      </nav>

      {/* =========================
          Mobile Menu
      ========================= */}

      {open && (
        <div
          id="mobile-menu"
          className="border-t border-zinc-200 bg-white md:hidden"
        >
          <div className="mx-auto max-w-7xl space-y-1 px-4 py-4 sm:px-6">
            {publicMenu.map((item) => {
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMenu}
                  aria-current={active ? "page" : undefined}
                  className={`block rounded-xl px-4 py-3 text-sm font-medium ${
                    active
                      ? "bg-zinc-900 text-white"
                      : "text-zinc-700 hover:bg-zinc-100"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            <Link
              href="/cart"
              onClick={closeMenu}
              className="block rounded-xl px-4 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
            >
              🛒 ตะกร้า
            </Link>

            {isLoading ? (
              <div className="mt-3 h-10 animate-pulse rounded-xl bg-zinc-100" />
            ) : isLoggedIn ? (
              <div className="mt-3 space-y-1 border-t border-zinc-200 pt-3">
                <div className="px-4 py-2 text-sm text-zinc-500">
                  👤 {session?.user?.name || "สมาชิก"}
                </div>

                <Link
                  href="/orders"
                  onClick={closeMenu}
                  className="block rounded-xl px-4 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
                >
                  📦 คำสั่งซื้อของฉัน
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full rounded-xl px-4 py-3 text-left text-sm font-semibold text-red-600 hover:bg-red-50"
                >
                  ออกจากระบบ
                </button>
              </div>
            ) : (
              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-zinc-200 pt-3">
                <Link
                  href="/login"
                  onClick={closeMenu}
                  className="rounded-xl border border-zinc-300 px-4 py-3 text-center text-sm font-semibold text-zinc-700"
                >
                  เข้าสู่ระบบ
                </Link>

                <Link
                  href="/register"
                  onClick={closeMenu}
                  className="rounded-xl bg-zinc-900 px-4 py-3 text-center text-sm font-semibold text-white"
                >
                  สมัครสมาชิก
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}