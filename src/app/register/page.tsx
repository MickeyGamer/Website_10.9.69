"use client";

import {
  FormEvent,
  useState,
} from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (loading) return;

    setError("");

    const cleanName =
      name.trim();

    const cleanEmail =
      email.trim().toLowerCase();

    // =========================
    // Validation
    // =========================

    if (
      !cleanName ||
      !cleanEmail ||
      !password ||
      !confirmPassword
    ) {
      setError(
        "กรุณากรอกข้อมูลให้ครบ"
      );

      toast.error(
        "กรุณากรอกข้อมูลให้ครบ"
      );

      return;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        cleanEmail
      )
    ) {
      setError(
        "รูปแบบอีเมลไม่ถูกต้อง"
      );

      toast.error(
        "กรุณาตรวจสอบอีเมล"
      );

      return;
    }

    if (password.length < 6) {
      setError(
        "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"
      );

      toast.error(
        "รหัสผ่านสั้นเกินไป"
      );

      return;
    }

    if (password.length > 100) {
      setError(
        "รหัสผ่านยาวเกินไป"
      );

      toast.error(
        "รหัสผ่านไม่ถูกต้อง"
      );

      return;
    }

    if (password !== confirmPassword) {
      setError(
        "รหัสผ่านไม่ตรงกัน"
      );

      toast.error(
        "กรุณายืนยันรหัสผ่านอีกครั้ง"
      );

      return;
    }

    setLoading(true);

    try {
      // =========================
      // Register API
      // =========================

      const response = await fetch(
        "/api/auth/register",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            name: cleanName,
            email: cleanEmail,
            password,
          }),
        }
      );

      let data: {
        message?: string;
        error?: string;
      } = {};

      try {
        data =
          await response.json();
      } catch {
        data = {};
      }

      // =========================
      // Failed
      // =========================

      if (!response.ok) {
        const message =
          data.error ||
          data.message ||
          "สมัครสมาชิกไม่สำเร็จ";

        setError(message);

        toast.error(message);

        return;
      }

      // =========================
      // Success
      // =========================

      toast.success(
        "สมัครสมาชิกสำเร็จ!"
      );

      // ล้าง password
      setPassword("");
      setConfirmPassword("");

      // ไป Login
      setTimeout(() => {
        router.replace(
          "/login"
        );
      }, 800);
    } catch (error) {
      console.error(
        "Register error:",
        error
      );

      setError(
        "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้"
      );

      toast.error(
        "ระบบขัดข้อง กรุณาลองใหม่"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12">

      <div className="mx-auto flex min-h-[80vh] w-full max-w-md items-center justify-center">

        <div className="w-full overflow-hidden rounded-[2rem] border border-gray-200 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.08)]">

          <div className="p-8 sm:p-10">

            {/* Logo */}

            <div className="mb-6 flex justify-center">

              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-950 text-2xl text-white shadow-lg">
                ✨
              </div>

            </div>

            {/* Header */}

            <div className="mb-8 text-center">

              <h1 className="text-3xl font-black tracking-tight text-gray-900">
                สร้างบัญชี
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                สมัครสมาชิก MickeyHub
              </p>

            </div>

            {/* Error */}

            {error && (
              <div
                role="alert"
                className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
              >
                {error}
              </div>
            )}

            {/* Form */}

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >

              {/* Name */}

              <div>

                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-bold text-gray-800"
                >
                  ชื่อ
                </label>

                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={name}
                  onChange={(e) =>
                    setName(
                      e.target.value
                    )
                  }
                  disabled={loading}
                  placeholder="ชื่อของคุณ"
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm outline-none transition focus:border-zinc-900 focus:bg-white focus:ring-4 focus:ring-zinc-900/5 disabled:opacity-60"
                />

              </div>

              {/* Email */}

              <div>

                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-bold text-gray-800"
                >
                  อีเมล
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(
                      e.target.value
                    )
                  }
                  disabled={loading}
                  placeholder="example@email.com"
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm outline-none transition focus:border-zinc-900 focus:bg-white focus:ring-4 focus:ring-zinc-900/5 disabled:opacity-60"
                />

              </div>

              {/* Password */}

              <div>

                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-bold text-gray-800"
                >
                  รหัสผ่าน
                </label>

                <div className="relative">

                  <input
                    id="password"
                    name="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) =>
                      setPassword(
                        e.target.value
                      )
                    }
                    disabled={loading}
                    placeholder="อย่างน้อย 6 ตัวอักษร"
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 pr-20 text-sm outline-none transition focus:border-zinc-900 focus:bg-white focus:ring-4 focus:ring-zinc-900/5 disabled:opacity-60"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (value) =>
                          !value
                      )
                    }
                    disabled={loading}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-semibold text-gray-500 hover:bg-gray-100"
                  >
                    {showPassword
                      ? "ซ่อน"
                      : "แสดง"}
                  </button>

                </div>

              </div>

              {/* Confirm Password */}

              <div>

                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-bold text-gray-800"
                >
                  ยืนยันรหัสผ่าน
                </label>

                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(
                      e.target.value
                    )
                  }
                  disabled={loading}
                  placeholder="กรอกรหัสผ่านอีกครั้ง"
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm outline-none transition focus:border-zinc-900 focus:bg-white focus:ring-4 focus:ring-zinc-900/5 disabled:opacity-60"
                />

              </div>

              {/* Register Button */}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-950 px-4 py-4 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
              >

                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                    กำลังสร้างบัญชี...
                  </>
                ) : (
                  <>
                    สมัครสมาชิก
                    <span>→</span>
                  </>
                )}

              </button>

            </form>

            {/* Login */}

            <div className="mt-7 border-t border-gray-100 pt-6 text-center">

              <p className="text-sm text-gray-500">
                มีบัญชีอยู่แล้ว?
              </p>

              <Link
                href="/login"
                className="mt-1 inline-flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-700"
              >
                เข้าสู่ระบบ
                <span>→</span>
              </Link>

            </div>

            {/* Security */}

            <div className="mt-6 rounded-2xl bg-gray-50 p-4">

              <div className="flex gap-3">

                <span className="text-lg">
                  🛡️
                </span>

                <div>

                  <p className="text-xs font-bold text-gray-800">
                    ข้อมูลบัญชีของคุณ
                  </p>

                  <p className="mt-1 text-[11px] leading-5 text-gray-500">
                    รหัสผ่านจะถูกจัดการโดยระบบ
                    Authentication
                    และไม่แสดงในหน้าเว็บไซต์
                  </p>

                </div>

              </div>

            </div>

          </div>
        </div>
      </div>
    </main>
  );
}