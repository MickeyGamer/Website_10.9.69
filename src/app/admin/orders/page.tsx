"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      const data: any = await res.json();
      if (Array.isArray(data)) setOrders(data);
    } catch {
      toast.error("โหลดข้อมูลคำสั่งซื้อล้มเหลว");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    const toastId = toast.loading("กำลังอัปเดตสถานะ...");
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        toast.success("อัปเดตสถานะสำเร็จ", { id: toastId });
        // อัปเดต State ทันทีโดยไม่ต้องโหลดหน้าใหม่
        setOrders(orders.map(order => 
          order._id === orderId ? { ...order, status: newStatus } : order
        ));
      } else {
        toast.error("อัปเดตล้มเหลว", { id: toastId });
      }
    } catch {
      toast.error("ระบบขัดข้อง", { id: toastId });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING": return <span className="bg-amber-50 text-amber-600 border border-amber-200 px-3 py-1 rounded-full text-xs font-bold">รอชำระเงิน</span>;
      case "PAID": return <span className="bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1 rounded-full text-xs font-bold">จ่ายแล้ว</span>;
      case "SHIPPED": return <span className="bg-purple-50 text-purple-600 border border-purple-200 px-3 py-1 rounded-full text-xs font-bold">จัดส่งแล้ว</span>;
      case "COMPLETED": return <span className="bg-emerald-50 text-emerald-600 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold">สำเร็จ</span>;
      case "CANCELLED": return <span className="bg-red-50 text-red-600 border border-red-200 px-3 py-1 rounded-full text-xs font-bold">ยกเลิก</span>;
      default: return <span>{status}</span>;
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04)]">
        <h1 className="text-2xl font-black text-zinc-900 tracking-tight">คำสั่งซื้อ (Orders)</h1>
        <p className="text-sm text-zinc-500 mt-1">ตรวจสอบการชำระเงินและสถานะการจัดส่งสินค้า</p>
      </div>

      <div className="bg-white border border-zinc-100 rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-16 text-center text-zinc-400 font-medium">กำลังโหลดรายการ...</div>
        ) : orders.length === 0 ? (
          <div className="p-16 text-center text-zinc-400 font-medium">ยังไม่มีคำสั่งซื้อเข้ามาเลยครับ</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50/75 border-b border-zinc-100 text-zinc-400 uppercase tracking-wider text-xs">
                <tr>
                  <th className="p-6 font-bold">รหัสคำสั่งซื้อ / ลูกค้า</th>
                  <th className="p-6 font-bold">รายการสินค้า</th>
                  <th className="p-6 font-bold">ยอดสุทธิ</th>
                  <th className="p-6 font-bold">สถานะ</th>
                  <th className="p-6 font-bold text-right">ปรับสถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="p-6">
                      <p className="font-mono text-xs text-zinc-400 mb-1">#{order._id.slice(-6).toUpperCase()}</p>
                      <p className="font-bold text-zinc-900">{order.user?.name || "ไม่ทราบชื่อ"}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">{new Date(order.createdAt).toLocaleDateString('th-TH')}</p>
                    </td>
                    <td className="p-6">
                      <div className="space-y-1 max-w-[200px]">
                        {order.items.map((item: any, idx: number) => (
                          <div key={idx} className="text-zinc-600 text-xs truncate" title={item.product?.name}>
                            <span className="font-bold text-zinc-900">{item.quantity}x</span> {item.product?.name || "สินค้าถูกลบ"}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="p-6 font-black text-zinc-900">
                      ฿{order.totalAmount.toLocaleString()}
                    </td>
                    <td className="p-6">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="p-6 text-right">
                      {/* Dropdown เปลี่ยนสถานะแบบไวๆ */}
                      <select 
                        className="bg-zinc-50 border border-zinc-200 text-zinc-700 text-xs rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-zinc-900 cursor-pointer"
                        value={order.status}
                        onChange={(e: any) => handleUpdateStatus(order._id, e.target.value)}
                      >
                        <option value="PENDING">รอชำระเงิน</option>
                        <option value="PAID">ยืนยันจ่ายเงิน</option>
                        <option value="SHIPPED">จัดส่งแล้ว</option>
                        <option value="COMPLETED">สำเร็จ</option>
                        <option value="CANCELLED">ยกเลิก</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}