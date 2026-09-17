import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

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
        <Navbar />
        
        <main className="flex-grow">
          {children}
        </main>
        
        <footer className="bg-white border-t py-10 mt-12">
          <div className="max-w-6xl mx-auto px-4 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Mickey Hub. สร้างสรรค์ด้วย Next.js และ Tailwind CSS
          </div>
        </footer>
      </body>
    </html>
  );
}