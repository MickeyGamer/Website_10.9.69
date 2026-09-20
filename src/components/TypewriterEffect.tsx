"use client";

import { useState, useEffect } from "react";

interface TypewriterEffectProps {
  words: string[];
}

export default function TypewriterEffect({ words }: TypewriterEffectProps) {
  const [text, setText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = words[wordIndex];
    // ความเร็วตอนพิมพ์ (100ms) และตอนลบ (50ms)
    const typeSpeed = isDeleting ? 50 : 100; 

    const timeout = setTimeout(() => {
      if (!isDeleting && text === currentWord) {
        // พิมพ์เสร็จแล้ว ให้หน่วงเวลา 2 วินาที ก่อนเริ่มลบ
        setTimeout(() => setIsDeleting(true), 2000);
      } else if (isDeleting && text === "") {
        // ลบหมดแล้ว ให้เปลี่ยนไปคำถัดไป
        setIsDeleting(false);
        setWordIndex((prev) => (prev + 1) % words.length);
      } else {
        // กำลังพิมพ์ หรือ กำลังลบ ทีละ 1 ตัวอักษร
        setText(currentWord.substring(0, text.length + (isDeleting ? -1 : 1)));
      }
    }, typeSpeed);

    return () => clearTimeout(timeout);
  }, [text, isDeleting, wordIndex, words]);

  return (
    <span className="inline-block">
      <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
        {text}
      </span>
      {/* เคอร์เซอร์กะพริบ */}
      <span className="inline-block w-[3px] h-[1em] bg-zinc-900 ml-1 animate-pulse align-middle"></span>
    </span>
  );
}