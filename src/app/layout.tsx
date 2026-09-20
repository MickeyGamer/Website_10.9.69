import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import ClientNavbar from "@/components/ClientNavbar";
import Navbar from "@/components/Navbar"; // 1. นำเข้า Navbar กลับมาที่นี่
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Mickey Blog | แบ่งปันความรู้ไอที",
  description: "บล็อกส่วนตัว แบ่งปันความรู้และประสบการณ์ด้าน IT",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className="bg-gray-50 text-gray-900 flex flex-col min-h-screen font-sans antialiased">
        <Providers>
          <Toaster position="top-center" />
          
          {/* 2. ใช้ ClientNavbar ห่อหุ้ม Navbar เอาไว้ (วิธีนี้ Next.js จะไม่เอา Mongoose ไปฝั่ง Client) */}
          <ClientNavbar>
            <Navbar />
          </ClientNavbar>
          
          <main className="flex-grow">
            {children}
          </main>
          
          <footer className="bg-white border-t py-10 mt-12">
            <div className="max-w-6xl mx-auto px-4 text-center text-sm text-gray-500">
              © {new Date().getFullYear()} Mickey Hub. สร้างสรรค์ด้วย Next.js และ Tailwind CSS
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}