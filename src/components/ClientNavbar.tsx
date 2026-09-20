"use client";

import { usePathname } from "next/navigation";

export default function ClientNavbar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // ถ้าอยู่หน้า login หรือ register ให้ซ่อนสิ่งที่อยู่ข้างใน
  if (pathname === "/login" || pathname === "/register") {
    return null;
  }

  // ถ้าหน้าอื่น ก็แสดงสิ่งที่ถูกส่งเข้ามา (ซึ่งก็คือ Navbar)
  return <>{children}</>;
}