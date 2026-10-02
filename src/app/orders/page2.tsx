"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type Product = {
  _id: string;
  name: string;
};

type OrderItem = {
  product: Product | null;
  quantity: number;
  price: number;
};

type Order = {
  _id: string;
  items: OrderItem[];
  totalAmount: number;
  status: "PENDING" | "PAID" | "SHIPPED" | "COMPLETED" | "CANCELLED";
  createdAt: string;
};

const statusLabels: Record<Order["status"], string> = {
  PENDING: "รอดำเนินการ",
  PAID: "ชำระเงินแล้ว",
  SHIPPED: "กำลังจัดส่ง",
  COMPLETED: "สำเร็จ",
  CANCELLED: "ยกเลิก",
};

export default function OrdersPage() {
  const { data: session, status } = useSession();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status !== "authenticated") {
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoadingOrders(true);
        setError("");

        const response = await fetch("/api/orders", {
          method: "GET",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error || "ไม่สามารถโหลดคำสั่งซื้อได้"
          );
        }

        if (!Array.isArray(data)) {
          throw new Error("รูปแบบข้อมูลคำสั่งซื้อไม่ถูกต้อง");
        }

        setOrders(data);
      } catch (err) {
        console.error("Fetch orders error:", err);

        setError(
          err instanceof Error
            ? err.message
            : "ไม่สามารถโหลดคำสั่งซื้อได้"
        );
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [status]);

  if (status === "loading") {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="h-8 w-48 animate-pulse rounded bg-zinc-200" />
        <div className="mt-6 h-32 animate-pulse rounded-2xl bg-zinc-100" />
      </main>
    );
  }

  if (status !== "authenticated") {
    return (
      <main className="mx-auto max-w-5xl px-4 py-16">
        <div className="mx-auto max-w-md rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
          <div className="text-4xl">🔐</div>

          <h1 className="mt-4 text-xl font-bold text-zinc-900">
            กรุณาเข้าสู่ระบบ
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            คุณต้องเข้าสู่ระบบก่อนจึงจะดูคำสั่งซื้อของคุณได้
          </p>

          <Link
            href="/login"
            className="mt-6 inline-flex rounded-xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
          >
            เข้าสู่ระบบ
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div>
        <p className="text-sm text-zinc-500">
          👤 {session.user?.name || "สมาชิก"}
        </p>

        <h1 className="mt-1 text-3xl font-bold tracking-tight text-zinc-900">
          คำสั่งซื้อของฉัน
        </h1>

        <p className="mt-2 text-zinc-500">
          ดูคำสั่งซื้อ สถานะการชำระเงิน และการจัดส่ง
        </p>
      </div>

      {/* Loading Orders */}
      {loadingOrders && (
        <div className="mt-8 space-y-4">
          {[1, 2].map((item) => (
            <div
              key={item}
              className="animate-pulse rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
            >
              <div className="h-5 w-48 rounded bg-zinc-200" />
              <div className="mt-4 h-4 w-32 rounded bg-zinc-100" />
              <div className="mt-6 h-16 rounded-xl bg-zinc-100" />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {!loadingOrders && error && (
        <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6">
          <div className="flex items-start gap-3">
            <div className="text-2xl">⚠️</div>

            <div>
              <h2 className="font-semibold text-red-900">
                ไม่สามารถโหลดคำสั่งซื้อได้
              </h2>

              <p className="mt-1 text-sm text-red-700">
                {error}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loadingOrders && !error && orders.length === 0 && (
        <div className="mt-8 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-10 text-center">
          <div className="text-5xl">📦</div>

          <h2 className="mt-4 text-lg font-semibold text-zinc-900">
            ยังไม่มีคำสั่งซื้อ
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500">
            เมื่อคุณสั่งซื้อสินค้า คำสั่งซื้อของคุณจะแสดงอยู่ที่หน้านี้
          </p>

          <Link
            href="/shop"
            className="mt-6 inline-flex rounded-xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800"
          >
            🛒 ไปเลือกซื้อสินค้า
          </Link>
        </div>
      )}

      {/* Order List */}
      {!loadingOrders && !error && orders.length > 0 && (
        <div className="mt-8 space-y-5">
          {orders.map((order) => (
            <div
              key={order._id}
              className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
            >
              {/* Order Header */}
              <div className="flex flex-col gap-3 border-b border-zinc-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-zinc-500">
                    หมายเลขคำสั่งซื้อ
                  </p>

                  <p className="mt-1 font-semibold text-zinc-900">
                    #{order._id}
                  </p>

                  <p className="mt-1 text-xs text-zinc-400">
                    {new Date(order.createdAt).toLocaleString("th-TH")}
                  </p>
                </div>

                <span className="inline-flex w-fit rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold text-zinc-700">
                  {statusLabels[order.status] || order.status}
                </span>
              </div>

              {/* Items */}
              <div className="mt-5 space-y-3">
                {order.items.map((item, index) => (
                  <div
                    key={`${order._id}-${index}`}
                    className="flex items-center justify-between gap-4 rounded-xl bg-zinc-50 p-4"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-zinc-900">
                        {item.product?.name || "สินค้า"}
                      </p>

                      <p className="mt-1 text-sm text-zinc-500">
                        จำนวน {item.quantity} ชิ้น
                      </p>
                    </div>

                    <p className="shrink-0 font-semibold text-zinc-900">
                      ฿
                      {(
                        item.price * item.quantity
                      ).toLocaleString("th-TH")}
                    </p>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-5">
                <span className="text-sm font-medium text-zinc-500">
                  ยอดรวม
                </span>

                <span className="text-xl font-bold text-zinc-900">
                  ฿{order.totalAmount.toLocaleString("th-TH")}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}