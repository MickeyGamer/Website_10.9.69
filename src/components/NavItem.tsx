"use client";

import { useState } from "react";
import Link from "next/link";

export default function NavItem({ href, children }: { href: string; children: React.ReactNode }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      href={href}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        padding: "8px 16px",
        borderRadius: "12px",
        color: isHovered ? "#ffffff" : "#4b5563",
        backgroundColor: isHovered ? "#2563eb" : "transparent",
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        transition: "all 0.2s ease",
        textDecoration: "none",
        fontWeight: 500,
      }}
    >
      {children}
    </Link>
  );
}