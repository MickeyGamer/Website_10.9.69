"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

type OrderStatus =
  | "PENDING"
  | "PAID"
  | "SHIPPED"
  | "COMPLETED"
  | "CANCELLED";

interface OrderItem {
  quantity: number;
  price?: number;
  product?: {
    _id?: string;
    name?: string;
    images?: string[];
  };
}

interface Order {
  _id: string;
  user?: {
    _id?: string;
    name?: string;
    email?: string;
  };
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt?: string;

  // เผื่อ API ของคุณมีข้อมูลเพิ่มเติม
  shippingAddress?: {
    name?: string;
    phone?: string;
    address?: string;
    district?: string;
    province?: string;
    postalCode?: string;
  };

  paymentMethod?: string;
  paymentStatus?: string;
  trackingNumber?: string;
}

const statusLabels: Record<OrderStatus, string> = {
  PENDING: "รอชำระเงิน",
  PAID: "ชำระเงินแล้ว",
  SHIPPED: "จัดส่งแล้ว",
  COMPLETED: "สำเร็จ",
  CANCELLED: "ยกเลิก",
};

const statusClasses: Record<OrderStatus, string> = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  PAID: "bg-blue-50 text-blue-700 border-blue-200",
  SHIPPED: "bg-purple-50 text-purple-700 border-purple-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CANCELLED: "bg-red-50 text-red-700 border-red-200",
};

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();

  const orderId = params?.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchOrder = useCallback(async () => {
    if (!orderId) return;

    try {
      setLoading(true);

      const response = await fetch(`/api/orders/${orderId}`, {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "ไม่สามารถโหลดคำสั่งซื้อได้");
      }

      setOrder(data);
    } catch (error) {
      console.error("Fetch order error:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "ไม่สามารถโหลดข้อมูลคำสั่งซื้อได้"
      );
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const updateStatus = async (status: OrderStatus) => {
    if (!order) return;

    try {
      setUpdating(true);

      const toastId = toast.loading("กำลังอัปเดตสถานะ...");

      const response = await fetch(`/api/orders/${order._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "ไม่สามารถอัปเดตสถานะได้");
      }

      setOrder((current) =>
        current
          ? {
              ...current,
              status,
            }
          : current
      );

      toast.success("อัปเดตสถานะสำเร็จ", {
        id: toastId,
      });
    } catch (error) {
      console.error("Update order error:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "ไม่สามารถอัปเดตสถานะได้"
      );
    } finally {
      setUpdating(false);
    }
  };

  const formatPrice = (price: number) => {
    return `฿${Number(price || 0).toLocaleString("th-TH")}`;
  };

  const formatDate = (date?: string) => {
    if (!date) return "-";

    return new Date(date).toLocaleString("th-TH", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900" />
          <p className="text-sm font-medium text-zinc-500">
            กำลังโหลดรายละเอียดคำสั่งซื้อ...
          </p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-6">
        <div className="rounded-3xl border border-red-100 bg-red-50 p-8 text-center">
          <div className="mb-3 text-4xl">❌</div>

          <h1 className="text-xl font-black text-red-700">
            ไม่พบคำสั่งซื้อ
          </h1>

          <p className="mt-2 text-sm text-red-600">
            อาจถูกลบหรือไม่มีคำสั่งซื้อนี้อยู่ในระบบ
          </p>

          <button
            onClick={() => router.push("/admin/orders")}
            className="mt-6 rounded-xl bg-zinc-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-zinc-700"
          >
            ← กลับรายการคำสั่งซื้อ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-3xl border border-zinc-100 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <Link
            href="/admin/orders"
            className="mb-3 inline-flex text-sm font-medium text-zinc-500 transition hover:text-zinc-900"
          >
            ← กลับรายการคำสั่งซื้อ
          </Link>

          <h1 className="text-2xl font-black tracking-tight text-zinc-900">
            รายละเอียดคำสั่งซื้อ
          </h1>

          <p className="mt-1 font-mono text-xs text-zinc-400">
            #{order._id}
          </p>
        </div>

        <div
          className={`inline-flex w-fit items-center rounded-full border px-4 py-2 text-sm font-bold ${statusClasses[order.status]}`}
        >
          {statusLabels[order.status]}
        </div>
      </div>

      {/* Status Control */}
      <div className="rounded-3xl border border-zinc-100 bg-white p-6 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-black text-zinc-900">
            จัดการสถานะคำสั่งซื้อ
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            เปลี่ยนสถานะคำสั่งซื้อจากหน้านี้ได้เลย
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <select
            value={order.status}
            disabled={updating}
            onChange={(e) =>
              updateStatus(e.target.value as OrderStatus)
            }
            className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-zinc-900 focus:ring-2 focus:ring-zinc-100 sm:max-w-xs"
          >
            <option value="PENDING">รอชำระเงิน</option>
            <option value="PAID">ชำระเงินแล้ว</option>
            <option value="SHIPPED">จัดส่งแล้ว</option>
            <option value="COMPLETED">สำเร็จ</option>
            <option value="CANCELLED">ยกเลิก</option>
          </select>

          {updating && (
            <span className="text-sm text-zinc-500">
              กำลังบันทึก...
            </span>
          )}
        </div>
      </div>

      {/* Order Info */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Customer */}
        <div className="rounded-3xl border border-zinc-100 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-black text-zinc-900">
            ข้อมูลลูกค้า
          </h2>

          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">
                ชื่อ
              </p>

              <p className="mt-1 font-semibold text-zinc-900">
                {order.user?.name || "ไม่ทราบชื่อ"}
              </p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">
                Email
              </p>

              <p className="mt-1 text-sm text-zinc-600">
                {order.user?.email || "-"}
              </p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">
                User ID
              </p>

              <p className="mt-1 break-all font-mono text-xs text-zinc-500">
                {order.user?._id || "-"}
              </p>
            </div>
          </div>
        </div>

        {/* Order Date */}
        <div className="rounded-3xl border border-zinc-100 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-black text-zinc-900">
            ข้อมูลคำสั่งซื้อ
          </h2>

          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">
                วันที่สั่งซื้อ
              </p>

              <p className="mt-1 text-sm font-medium text-zinc-800">
                {formatDate(order.createdAt)}
              </p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">
                อัปเดตล่าสุด
              </p>

              <p className="mt-1 text-sm font-medium text-zinc-800">
                {formatDate(order.updatedAt)}
              </p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-zinc-400">
                วิธีชำระเงิน
              </p>

              <p className="mt-1 text-sm font-medium text-zinc-800">
                {order.paymentMethod || "ไม่ระบุ"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="overflow-hidden rounded-3xl border border-zinc-100 bg-white shadow-sm">
        <div className="border-b border-zinc-100 p-6">
          <h2 className="text-lg font-black text-zinc-900">
            รายการสินค้า
          </h2>

          <p className="mt-1 text-sm text-zinc-500">
            จำนวน {order.items?.length || 0} รายการ
          </p>
        </div>

        <div className="divide-y divide-zinc-100">
          {order.items?.map((item, index) => {
            const productName =
              item.product?.name || "สินค้าถูกลบ";

            const price = Number(item.price || 0);
            const quantity = Number(item.quantity || 0);

            return (
              <div
                key={`${item.product?._id || "item"}-${index}`}
                className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-lg">
                    📦
                  </div>

                  <div>
                    <p className="font-bold text-zinc-900">
                      {productName}
                    </p>

                    <p className="mt-1 text-xs text-zinc-500">
                      จำนวน {quantity} ชิ้น
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <p className="font-black text-zinc-900">
                    {formatPrice(price * quantity)}
                  </p>

                  <p className="mt-1 text-xs text-zinc-500">
                    {formatPrice(price)} × {quantity}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Total */}
        <div className="border-t border-zinc-100 bg-zinc-50 p-6">
          <div className="flex items-center justify-between">
            <span className="font-bold text-zinc-600">
              ยอดรวมทั้งหมด
            </span>

            <span className="text-2xl font-black text-zinc-900">
              {formatPrice(order.totalAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* Shipping */}
      <div className="rounded-3xl border border-zinc-100 bg-white p-6 shadow-sm">
        <h2 className="mb-5 text-lg font-black text-zinc-900">
          ข้อมูลจัดส่ง
        </h2>

        {order.shippingAddress ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-bold text-zinc-400">
                ผู้รับ
              </p>

              <p className="mt-1 font-medium text-zinc-800">
                {order.shippingAddress.name || "-"}
              </p>
            </div>

            <div>
              <p className="text-xs font-bold text-zinc-400">
                เบอร์โทร
              </p>

              <p className="mt-1 font-medium text-zinc-800">
                {order.shippingAddress.phone || "-"}
              </p>
            </div>

            <div className="sm:col-span-2">
              <p className="text-xs font-bold text-zinc-400">
                ที่อยู่
              </p>

              <p className="mt-1 leading-7 text-zinc-700">
                {order.shippingAddress.address || "-"}
                {order.shippingAddress.district &&
                  ` ${order.shippingAddress.district}`}
                {order.shippingAddress.province &&
                  ` ${order.shippingAddress.province}`}
                {order.shippingAddress.postalCode &&
                  ` ${order.shippingAddress.postalCode}`}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-zinc-500">
            ยังไม่มีข้อมูลที่อยู่จัดส่ง
          </p>
        )}
      </div>

      {/* Tracking */}
      {order.trackingNumber && (
        <div className="rounded-3xl border border-zinc-100 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-lg font-black text-zinc-900">
            ข้อมูลการจัดส่ง
          </h2>

          <p className="text-sm text-zinc-500">
            Tracking Number
          </p>

          <p className="mt-1 font-mono font-bold text-zinc-900">
            {order.trackingNumber}
          </p>
        </div>
      )}
    </div>
  );
}