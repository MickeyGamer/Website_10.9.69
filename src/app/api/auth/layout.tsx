import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      {/* ================================
          SKIP TO CONTENT
      ================================= */}
      <a
        href="#main-content"
        className="
          sr-only
          focus:not-sr-only
          focus:fixed
          focus:top-4
          focus:left-4
          focus:z-[100]
          focus:rounded-lg
          focus:bg-zinc-950
          focus:px-4
          focus:py-2
          focus:text-sm
          focus:font-medium
          focus:text-white
          focus:shadow-lg
        "
      >
        ข้ามไปยังเนื้อหาหลัก
      </a>

      {/* ================================
          NAVBAR
      ================================= */}
      <header
        role="banner"
        className="sticky top-0 z-50 w-full"
      >
        <Navbar />
      </header>

      {/* ================================
          MAIN CONTENT
      ================================= */}
      <main
        id="main-content"
        role="main"
        className="
          flex-1
          min-h-[calc(100vh-4rem)]
          transition-all
          duration-300
          ease-out
        "
      >
        {children}
      </main>

      {/* ================================
          FOOTER
      ================================= */}
      <Footer />

      {/* ================================
          SCROLL TO TOP
      ================================= */}
      <ScrollToTop />

      {/* ================================
          BOTTOM DECORATION
      ================================= */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          fixed
          bottom-0
          left-0
          z-40
          h-px
          w-full
          bg-gradient-to-r
          from-transparent
          via-blue-500/20
          to-transparent
        "
      />
    </div>
  );
}