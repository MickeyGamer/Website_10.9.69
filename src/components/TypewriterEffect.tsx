"use client";

import { useEffect, useState } from "react";

interface TypewriterEffectProps {
  words: string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseTime?: number;
}

export default function TypewriterEffect({
  words,
  typingSpeed = 80,
  deletingSpeed = 45,
  pauseTime = 1800,
}: TypewriterEffectProps) {
  const [text, setText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!words.length) return;

    const currentWord = words[wordIndex];

    if (!isDeleting && text === currentWord) {
      const pause = setTimeout(() => {
        setIsDeleting(true);
      }, pauseTime);

      return () => clearTimeout(pause);
    }

    if (isDeleting && text === "") {
      setIsDeleting(false);
      setWordIndex((prev) => (prev + 1) % words.length);
      return;
    }

    const speed = isDeleting ? deletingSpeed : typingSpeed;

    const timeout = setTimeout(() => {
      setText(
        currentWord.substring(
          0,
          text.length + (isDeleting ? -1 : 1)
        )
      );
    }, speed);

    return () => clearTimeout(timeout);
  }, [
    text,
    isDeleting,
    wordIndex,
    words,
    typingSpeed,
    deletingSpeed,
    pauseTime,
  ]);

  return (
    <span className="relative inline-flex items-center">
      {/* Glow ด้านหลัง */}
      <span
        aria-hidden="true"
        className="
          absolute inset-0
          bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500
          opacity-20 blur-xl
        "
      />

      {/* ข้อความ */}
      <span
        className="
          relative
          bg-gradient-to-r
          from-blue-600
          via-indigo-600
          to-purple-600
          bg-[length:200%_auto]
          bg-clip-text
          text-transparent
          animate-[gradient_4s_linear_infinite]
          font-bold
        "
      >
        {text}
      </span>

      {/* Cursor */}
      <span
        aria-hidden="true"
        className="
          relative
          ml-2
          h-[1.1em]
          w-[3px]
          rounded-full
          bg-gradient-to-b
          from-blue-500
          to-purple-600
          shadow-[0_0_8px_rgba(59,130,246,0.8)]
          animate-pulse
        "
      />
    </span>
  );
}