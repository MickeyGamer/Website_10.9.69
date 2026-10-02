import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { connectDB } from "@/lib/mongodb";
import { Order } from "@/models/Order";

interface PageProps {
  params: Promise<{ id: string }>;
}

interface PopulatedUser {
  _id: unknown;
  name?: string;
  email?: string;
}

interface PopulatedProduct {
  _id?: unknown;
  name?: string;
}

interface OrderItem {
  product?: PopulatedProduct | null;
  quantity?: number;
  price?: number;
}

export default async function OrderDetailPage({
  params,
}: PageProps) {
  const { id } = await params;

  // ตรวจสอบ Login
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // เชื่อมต่อ Database
  await connectDB();

  // ดึง Order
  const order = await Order.findById(id)
    .populate("user", "name email")
    .populate("items.product", "name")
    .lean();

  if (!order) {
    notFound();
  }

  const user = order.user as unknown as PopulatedUser | null;
  const items = (order.items ?? []) as unknown as OrderItem[];

  // ADMIN ดู Order ได้ทั้งหมด
  // USER / AUTHOR ดูได้เฉพาะ Order ของตัวเอง
  const isAdmin = session.user.role === "ADMIN";
  const orderUserId = user?._id ? String(user._id) : "";

  if (!isAdmin && orderUserId !== session.user.id) {
    notFound();
  }

  const total = items.reduce((sum, item) => {
    return sum + (item.price ?? 0) * (item.quantity ?? 0);
  }, 0);

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/orders"
            className="text-sm text-blue-600 hover:underline"
          >
            ← กลับไปคำสั่งซื้อ
          </Link>

          <h1 className="mt-3 text-2xl font-bold text-gray-900">
            รายละเอียดคำสั่งซื้อ
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Order ID: {String(order._id)}
          </p>
        </div>

        {/* Order Information */}
        <section className="rounded-xl bg-white p-6 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-gray-500">สถานะ</p>
              <p className="mt-1 font-semibold text-gray-900">
                {String(order.status ?? "-")}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">วันที่สั่งซื้อ</p>
              <p className="mt-1 font-semibold text-gray-900">
                {order.createdAt
                  ? new Date(order.createdAt).toLocaleString("th-TH")
                  : "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">ชื่อผู้สั่งซื้อ</p>
              <p className="mt-1 font-semibold text-gray-900">
                {user?.name ?? "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">อีเมล</p>
              <p className="mt-1 font-semibold text-gray-900">
                {user?.email ?? "-"}
              </p>
            </div>
          </div>
        </section>

        {/* Products */}
        <section className="mt-6 rounded-xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-gray-900">
            รายการสินค้า
          </h2>

          {items.length === 0 ? (
            <p className="text-sm text-gray-500">
              ไม่มีรายการสินค้า
            </p>
          ) : (
            <div className="divide-y">
              {items.map((item, index) => {
                const quantity = item.quantity ?? 0;
                const price = item.price ?? 0;
                const subtotal = price * quantity;

                return (
                  <div
                    key={String(item.product?._id ?? index)}
                    className="flex items-center justify-between gap-4 py-4"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {item.product?.name ?? "สินค้า"}
                      </p>

                      <p className="text-sm text-gray-500">
                        ฿{price.toLocaleString("th-TH")} × {quantity}
                      </p>
                    </div>

                    <p className="font-semibold text-gray-900">
                      ฿{subtotal.toLocaleString("th-TH")}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Total */}
          <div className="mt-4 flex justify-between border-t pt-4">
            <span className="font-bold text-gray-900">
              รวมทั้งหมด
            </span>

            <span className="text-xl font-bold text-gray-900">
              ฿{total.toLocaleString("th-TH")}
            </span>
          </div>
        </section>
      </div>
    </main>
  );
}