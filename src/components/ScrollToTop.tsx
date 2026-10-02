"use client";

import { useEffect, useState } from "react";

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 500);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!visible) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="กลับขึ้นด้านบน"
      title="กลับขึ้นด้านบน"
      className="
        fixed
        bottom-6
        right-6
        z-50
        flex
        h-12
        w-12
        items-center
        justify-center
        rounded-full
        bg-zinc-950
        text-xl
        text-white
        shadow-lg
        transition-all
        duration-300
        hover:-translate-y-1
        hover:bg-blue-600
        active:scale-95
        focus:outline-none
        focus:ring-2
        focus:ring-blue-500
        focus:ring-offset-2
      "
    >
      ↑
    </button>
  );
}