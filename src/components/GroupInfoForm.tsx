"use client";

import { FormEvent, useEffect, useState } from "react";

export default function GroupInfoForm() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    foundedYear: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    loadGroup();
  }, []);

  async function loadGroup() {
    try {
      const response = await fetch("/api/group");
      const data = await response.json();

      if (data.group) {
        setForm({
          name: data.group.name ?? "",
          description: data.group.description ?? "",
          foundedYear: String(data.group.foundedYear ?? ""),
        });
      }
    } catch (error) {
      console.error("โหลดข้อมูลกลุ่มไม่สำเร็จ", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSubmitting(true);
      setMessage("");
      setIsError(false);

      const response = await fetch("/api/group", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          foundedYear: Number(form.foundedYear),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message ?? "บันทึกไม่สำเร็จ");
      }

      setMessage("บันทึกข้อมูลกลุ่มสำเร็จ");
    } catch (error) {
      setIsError(true);
      setMessage(error instanceof Error ? error.message : "เกิดข้อผิดพลาด");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-gray-400">กำลังโหลด...</p>;
  }

  return (
    <div className="rounded-xl border p-6">
      <h1 className="text-xl font-bold">ข้อมูลกลุ่ม</h1>

      {message && (
        <p
          className={`mt-3 rounded-md px-3 py-2 text-sm ${
            isError ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"
          }`}
        >
          {message}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            ชื่อกลุ่ม
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-foreground/20"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            คำอธิบายกลุ่ม
          </label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={4}
            required
            className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-foreground/20"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            ปีที่ก่อตั้ง
          </label>
          <input
            type="number"
            value={form.foundedYear}
            onChange={(e) => setForm({ ...form, foundedYear: e.target.value })}
            required
            className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-foreground/20"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-foreground py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? "กำลังบันทึก..." : "บันทึกข้อมูลกลุ่ม"}
        </button>
      </form>
    </div>
  );
}