import { NextResponse } from "next/server";
import { auth } from "@/auth";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  // ดึงสิทธิ์ (Role) จาก Session
  const role = (req.auth?.user as any)?.role;

  // กฎ: ถ้าพยายามเข้าหน้าที่มีคำว่า /admin
  if (nextUrl.pathname.startsWith("/admin")) {
    // ถ้าไม่ได้ล็อกอิน หรือ ไม่ใช่แอดมิน -> เตะกลับหน้าแรกทันที
    if (!isLoggedIn || role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
  }
});

// กำหนดให้ Middleware ทำงานกับทุกหน้า ยกเว้นพวก API และไฟล์รูปภาพ
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};