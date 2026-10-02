"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

interface ClientNavbarProps {
  children: ReactNode;
}

export default function ClientNavbar({
  children,
}: ClientNavbarProps) {
  const pathname = usePathname() ?? "";

  /*
   * =========================================================
   * หน้าที่ไม่ต้องการแสดง Navbar
   * =========================================================
   *
   * ใช้ startsWith เพื่อให้สามารถซ่อน Navbar
   * ในหน้าที่อยู่ภายใต้ path เดียวกันได้ เช่น
   *
   * /login
   * /login/forgot-password
   * /login/reset-password
   *
   */

  const hiddenNavbarPaths = [
    "/login",
    "/register",
  ];

  const shouldHideNavbar = hiddenNavbarPaths.some((path) =>
    pathname === path || pathname.startsWith(`${path}/`)
  );

  /*
   * =========================================================
   * ซ่อน Navbar
   * =========================================================
   */

  if (shouldHideNavbar) {
    return (
      <div
        aria-hidden="true"
        className="hidden"
      >
        {children}
      </div>
    );
  }

  /*
   * =========================================================
   * แสดง Navbar
   * =========================================================
   */

  return (
    <div
      role="banner"
      className="
        sticky top-0 z-50
        transition-all duration-300 ease-out
      "
    >
      {children}
    </div>
  );
}