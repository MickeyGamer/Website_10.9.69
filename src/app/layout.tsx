import type { Metadata } from "next";
import "./globals.css";

import Providers from "@/components/Providers";
import ClientNavbar from "@/components/ClientNavbar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";

export const metadata: Metadata = {
  title: {
    default: "MickeyHub",
    template: "%s | MickeyHub",
  },
  description: "MickeyHub — แบ่งปันความรู้และประสบการณ์ด้าน IT",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <Providers>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[9999] focus:rounded-lg focus:bg-blue-600 focus:px-4 focus:py-2 focus:text-white"
          >
            ข้ามไปยังเนื้อหาหลัก
          </a>

          <ClientNavbar>
            <header
              role="banner"
              className="sticky top-0 z-50 w-full"
            >
              <Navbar />
            </header>
          </ClientNavbar>

          <main
            id="main-content"
            role="main"
            className="min-h-[calc(100vh-160px)]"
          >
            {children}
          </main>

          <Footer />

          <ScrollToTop />
        </Providers>
      </body>
    </html>
  );
}