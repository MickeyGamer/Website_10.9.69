"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =========================================================
  // LOGIN
  // =========================================================

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (loading) return;

    setError("");

    const cleanEmail = email.trim().toLowerCase();

    // ตรวจสอบข้อมูล
    if (!cleanEmail || !password) {
      setError("กรุณากรอกอีเมลและรหัสผ่าน");
      toast.error("กรุณากรอกข้อมูลให้ครบ");
      return;
    }

    // ตรวจสอบรูปแบบ Email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("รูปแบบอีเมลไม่ถูกต้อง");
      toast.error("กรุณาตรวจสอบอีเมล");
      return;
    }

    setLoading(true);

    try {
      // =====================================================
      // AUTH.JS
      // =====================================================

      const result = await signIn("credentials", {
        email: cleanEmail,
        password,
        redirect: false,
      });

      // Login ไม่สำเร็จ
      if (!result || result.error || !result.ok) {
        setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
        toast.error("เข้าสู่ระบบไม่สำเร็จ");
        return;
      }

      // Login สำเร็จ
      toast.success("เข้าสู่ระบบสำเร็จ!");

      // รองรับ callbackUrl
      const params = new URLSearchParams(window.location.search);
      const callbackUrl = params.get("callbackUrl") || "/";

      window.location.href = callbackUrl;
    } catch (err) {
      console.error("Login error:", err);

      setError("ระบบขัดข้อง กรุณาลองใหม่อีกครั้ง");
      toast.error("เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020807] text-white">

      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div className="absolute inset-0 bg-gradient-to-br from-[#03110e] via-[#061b17] to-[#010504]" />

      <div
        className="
          absolute
          inset-0
          bg-[radial-gradient(circle_at_20%_50%,rgba(0,255,200,0.18),transparent_35%),radial-gradient(circle_at_80%_20%,rgba(0,255,170,0.12),transparent_30%)]
        "
      />

      {/* Glow ซ้าย */}
      <div
        className="
          absolute
          left-[10%]
          top-[20%]
          h-72
          w-72
          rounded-full
          bg-cyan-400/10
          blur-[120px]
        "
      />

      {/* Glow ขวา */}
      <div
        className="
          absolute
          bottom-[10%]
          right-[10%]
          h-72
          w-72
          rounded-full
          bg-emerald-400/10
          blur-[120px]
        "
      />

      {/* =====================================================
          CENTER
      ===================================================== */}

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8">

        {/* ===================================================
            LOGIN CARD
        =================================================== */}

        <div
          className="
            w-full
            max-w-[900px]
            overflow-hidden
            rounded-[28px]
            border
            border-white/10
            bg-white/[0.05]
            shadow-[0_30px_100px_rgba(0,0,0,0.6)]
            backdrop-blur-2xl
          "
        >

          <div className="grid md:grid-cols-2">

            {/* =================================================
                LEFT SIDE
            ================================================= */}

            <section
              className="
                relative
                hidden
                min-h-[580px]
                overflow-hidden
                border-r
                border-white/10
                bg-gradient-to-br
                from-emerald-400/10
                via-cyan-400/5
                to-transparent
                md:flex
                md:flex-col
                md:items-center
                md:justify-center
              "
            >

              {/* -------------------------------------------------
                  Lamp
              ------------------------------------------------- */}

              <div className="absolute left-1/2 top-0 -translate-x-1/2">

                <div className="mx-auto h-12 w-[2px] bg-white/50" />

                <div
                  className="
                    h-0
                    w-0
                    border-l-[38px]
                    border-r-[38px]
                    border-t-[50px]
                    border-l-transparent
                    border-r-transparent
                    border-t-cyan-100/70
                    drop-shadow-[0_0_25px_rgba(0,255,220,0.8)]
                  "
                />

                <div
                  className="
                    absolute
                    left-1/2
                    top-[48px]
                    h-24
                    w-36
                    -translate-x-1/2
                    rounded-full
                    bg-cyan-300/20
                    blur-3xl
                  "
                />

              </div>

              {/* -------------------------------------------------
                  Logo
              ------------------------------------------------- */}

              <div
                className="
                  relative
                  mt-20
                  flex
                  h-36
                  w-36
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-cyan-200/20
                  bg-cyan-300/10
                  shadow-[0_0_60px_rgba(0,255,220,0.25)]
                "
              >

                <div
                  className="
                    absolute
                    inset-3
                    rounded-full
                    border
                    border-cyan-200/10
                  "
                />

                {/* Robot SVG */}
                <svg
                  viewBox="0 0 100 100"
                  className="
                    h-24
                    w-24
                    text-cyan-200
                    drop-shadow-[0_0_18px_rgba(0,255,220,0.8)]
                  "
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <rect
                    x="18"
                    y="25"
                    width="64"
                    height="52"
                    rx="18"
                  />

                  <path d="M50 25V15" />

                  <circle
                    cx="50"
                    cy="12"
                    r="3"
                    fill="currentColor"
                  />

                  <circle
                    cx="38"
                    cy="48"
                    r="6"
                    fill="currentColor"
                  />

                  <circle
                    cx="62"
                    cy="48"
                    r="6"
                    fill="currentColor"
                  />

                  <path
                    d="M35 63C43 70 57 70 65 63"
                    strokeLinecap="round"
                  />
                </svg>

              </div>

              {/* -------------------------------------------------
                  Brand
              ------------------------------------------------- */}

              <h2 className="mt-7 text-3xl font-black">
                Mickey
                <span className="text-cyan-300">
                  Hub
                </span>
              </h2>

              <p
                className="
                  mt-3
                  max-w-[250px]
                  text-center
                  text-sm
                  leading-6
                  text-white/40
                "
              >
                Your digital space for creativity,
                content and community.
              </p>

              {/* -------------------------------------------------
                  Secure Status
              ------------------------------------------------- */}

              <div
                className="
                  mt-7
                  flex
                  items-center
                  gap-2
                  rounded-full
                  border
                  border-emerald-300/10
                  bg-emerald-300/5
                  px-4
                  py-2
                "
              >
                <span
                  className="
                    h-2
                    w-2
                    rounded-full
                    bg-emerald-300
                    shadow-[0_0_12px_rgba(0,255,180,0.8)]
                  "
                />

                <span className="text-xs text-emerald-200/70">
                  Secure System
                </span>
              </div>

              {/* -------------------------------------------------
                  Decoration
              ------------------------------------------------- */}

              <div
                className="
                  absolute
                  -bottom-24
                  -left-24
                  h-56
                  w-56
                  rounded-full
                  border
                  border-cyan-300/10
                "
              />

              <div
                className="
                  absolute
                  -right-24
                  -top-24
                  h-56
                  w-56
                  rounded-full
                  border
                  border-cyan-300/10
                "
              />

            </section>

            {/* =================================================
                RIGHT SIDE
            ================================================= */}

            <section
              className="
                flex
                min-h-[580px]
                flex-col
                justify-center
                p-7
                sm:p-10
              "
            >

              {/* -------------------------------------------------
                  Mobile Logo
              ------------------------------------------------- */}

              <div className="mb-7 flex items-center gap-3 md:hidden">

                <div
                  className="
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-cyan-300/20
                    bg-cyan-300/10
                    text-cyan-200
                  "
                >
                  ✦
                </div>

                <div>
                  <p className="font-black">
                    Mickey
                    <span className="text-cyan-300">
                      Hub
                    </span>
                  </p>

                  <p className="text-[10px] text-white/30">
                    Secure Authentication
                  </p>
                </div>

              </div>

              {/* -------------------------------------------------
                  Header
              ------------------------------------------------- */}

              <div className="mb-7">

                <div className="mb-3 flex items-center gap-2">

                  <span className="h-px w-8 bg-cyan-300/60" />

                  <span
                    className="
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-[0.3em]
                      text-cyan-300
                    "
                  >
                    Authentication
                  </span>

                </div>

                <h1
                  className="
                    text-4xl
                    font-black
                    tracking-tight
                  "
                >
                  Welcome Back
                  <span className="text-cyan-300">
                    .
                  </span>
                </h1>

                <p
                  className="
                    mt-3
                    text-sm
                    leading-6
                    text-white/40
                  "
                >
                  Put the card to authenticate
                  your account.
                </p>

              </div>

              {/* -------------------------------------------------
                  Error
              ------------------------------------------------- */}

              {error && (
                <div
                  role="alert"
                  className="
                    mb-5
                    rounded-xl
                    border
                    border-red-400/20
                    bg-red-500/10
                    px-4
                    py-3
                    text-sm
                    text-red-300
                  "
                >
                  ⚠ {error}
                </div>
              )}

              {/* =================================================
                  LOGIN FORM
              ================================================= */}

              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >

                {/* -------------------------------------------------
                    Email
                ------------------------------------------------- */}

                <div>

                  <label
                    htmlFor="email"
                    className="
                      mb-2
                      block
                      text-xs
                      font-bold
                      uppercase
                      tracking-wider
                      text-white/50
                    "
                  >
                    Email
                  </label>

                  <div className="relative">

                    <span
                      className="
                        pointer-events-none
                        absolute
                        left-4
                        top-1/2
                        -translate-y-1/2
                        text-cyan-300/60
                      "
                    >
                      👤
                    </span>

                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) =>
                        setEmail(e.target.value)
                      }
                      disabled={loading}
                      placeholder="Enter your email"
                      className="
                        w-full
                        rounded-xl
                        border
                        border-white/10
                        bg-black/20
                        px-11
                        py-3.5
                        text-sm
                        text-white
                        outline-none
                        transition
                        placeholder:text-white/20
                        focus:border-cyan-300/50
                        focus:bg-cyan-300/5
                        disabled:opacity-50
                      "
                    />

                  </div>

                </div>

                {/* -------------------------------------------------
                    Password
                ------------------------------------------------- */}

                <div>

                  <label
                    htmlFor="password"
                    className="
                      mb-2
                      block
                      text-xs
                      font-bold
                      uppercase
                      tracking-wider
                      text-white/50
                    "
                  >
                    Password
                  </label>

                  <div className="relative">

                    <span
                      className="
                        pointer-events-none
                        absolute
                        left-4
                        top-1/2
                        -translate-y-1/2
                        text-cyan-300/60
                      "
                    >
                      🔒
                    </span>

                    <input
                      id="password"
                      name="password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) =>
                        setPassword(e.target.value)
                      }
                      disabled={loading}
                      placeholder="Enter your password"
                      className="
                        w-full
                        rounded-xl
                        border
                        border-white/10
                        bg-black/20
                        px-11
                        py-3.5
                        pr-20
                        text-sm
                        text-white
                        outline-none
                        transition
                        placeholder:text-white/20
                        focus:border-cyan-300/50
                        focus:bg-cyan-300/5
                        disabled:opacity-50
                      "
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (value) => !value
                        )
                      }
                      disabled={loading}
                      className="
                        absolute
                        right-3
                        top-1/2
                        -translate-y-1/2
                        rounded-lg
                        px-2
                        py-1
                        text-xs
                        text-cyan-300/60
                        transition
                        hover:bg-cyan-300/10
                        hover:text-cyan-200
                      "
                    >
                      {showPassword
                        ? "ซ่อน"
                        : "แสดง"}
                    </button>

                  </div>

                </div>

                {/* -------------------------------------------------
                    Login Button
                ------------------------------------------------- */}

                <button
                  type="submit"
                  disabled={loading}
                  className="
                    w-full
                    rounded-xl
                    bg-gradient-to-r
                    from-emerald-300
                    via-cyan-300
                    to-emerald-300
                    py-3.5
                    text-sm
                    font-black
                    text-[#03110f]
                    shadow-[0_0_30px_rgba(0,255,210,0.25)]
                    transition
                    hover:-translate-y-0.5
                    hover:shadow-[0_0_45px_rgba(0,255,210,0.4)]
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">

                      <span
                        className="
                          h-4
                          w-4
                          animate-spin
                          rounded-full
                          border-2
                          border-black/20
                          border-t-black
                        "
                      />

                      กำลังเข้าสู่ระบบ...

                    </span>
                  ) : (
                    <span>
                      Sign In →
                    </span>
                  )}
                </button>

              </form>

              {/* =================================================
                  DIVIDER
              ================================================= */}

              <div className="my-6 flex items-center gap-3">

                <div className="h-px flex-1 bg-white/10" />

                <span
                  className="
                    text-[9px]
                    uppercase
                    tracking-widest
                    text-white/20
                  "
                >
                  or continue with
                </span>

                <div className="h-px flex-1 bg-white/10" />

              </div>

              {/* =================================================
                  SOCIAL LOGIN
              ================================================= */}

              <div className="grid grid-cols-2 gap-3">

                <button
                  type="button"
                  className="
                    rounded-xl
                    border
                    border-white/10
                    bg-white/[0.03]
                    py-3
                    text-xs
                    font-semibold
                    text-white/50
                    transition
                    hover:border-cyan-300/20
                    hover:bg-cyan-300/5
                    hover:text-white
                  "
                >
                  <span className="mr-2">
                    G
                  </span>
                  Google
                </button>

                <button
                  type="button"
                  className="
                    rounded-xl
                    border
                    border-white/10
                    bg-white/[0.03]
                    py-3
                    text-xs
                    font-semibold
                    text-white/50
                    transition
                    hover:border-cyan-300/20
                    hover:bg-cyan-300/5
                    hover:text-white
                  "
                >
                  <span className="mr-2">
                    ●
                  </span>
                  GitHub
                </button>

              </div>

              {/* =================================================
                  REGISTER
              ================================================= */}

              <div className="mt-7 text-center">

                <span className="text-sm text-white/35">
                ยังไม่มีบัญชีใช่ไหม?
                </span>

                <Link
                  href="/register"
                  className="
                    ml-1
                    text-sm
                    font-bold
                    text-cyan-300
                    transition-colors
                    duration-200
                    hover:text-cyan-200
                  "
                >
                  สมัครสมาชิก →
                </Link>

              </div>

              {/* =================================================
                  SECURITY
              ================================================= */}

              <div
                className="
                  mt-6
                  text-center
                  text-[10px]
                  text-white/20
                "
              >
                🔐 Secure authentication powered by Auth.js
              </div>

            </section>

          </div>

        </div>

      </div>

    </main>
  );
}