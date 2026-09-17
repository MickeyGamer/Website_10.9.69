"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useCartStore } from "@/store/CartStore";
import Link from "next/link";

export default function ShopPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // ดึงฟังก์ชันมาจาก Zustand (สมองกลตะกร้าสินค้า)
  const addItem = useCartStore(state => state.addItem);
  const cartItems = useCartStore(state => state.items);

  // คำนวณจำนวนชิ้นในตะกร้า
  const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        
        if (Array.isArray(data)) {
          // ดึงเฉพาะสินค้าที่ตั้งสถานะเป็น "เปิดขาย" (isActive: true) เท่านั้น
          const activeProducts = data.filter(p => p.isActive);
          setProducts(activeProducts);
        }
      } catch (error) {
        toast.error("โหลดข้อมูลสินค้าล้มเหลว");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = (product: any) => {
    addItem(product);
    toast.success(`เพิ่ม ${product.name} ลงตะกร้าแล้ว`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      {/* ส่วนหัวร้านค้า */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-black text-zinc-900 tracking-tight">ร้านค้า (Shop)</h1>
          <p className="text-zinc-500 mt-2">สินค้าพรีเมียมคัดสรรพิเศษสำหรับคุณ</p>
        </div>
        
        {/* ปุ่มตะกร้าสินค้า */}
        <Link 
          href="/cart" 
          className="relative bg-white border border-zinc-200 text-zinc-900 font-semibold px-6 py-3 rounded-2xl hover:border-zinc-900 transition flex items-center gap-2 shadow-sm"
        >
          <span>🛒 ตะกร้าของฉัน</span>
          {totalCartItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full animate-bounce shadow-md">
              {totalCartItems}
            </span>
          )}
        </Link>
      </div>

      {/* พื้นที่แสดงสินค้า */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <div className="w-8 h-8 border-4 border-zinc-200 border-t-zinc-900 rounded-full animate-spin" />
          <p className="text-zinc-400 font-medium">กำลังโหลดสินค้า...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-zinc-50 rounded-3xl border border-dashed border-zinc-200">
          <p className="text-zinc-500 text-lg">ยังไม่มีสินค้าวางจำหน่ายในขณะนี้ แวะมาใหม่น้า 🛍️</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <div key={product._id} className="group flex flex-col bg-white rounded-3xl overflow-hidden shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04)] hover:shadow-xl transition-all duration-300 border border-zinc-100">
              
              {/* รูปสินค้า */}
              <div className="aspect-[4/5] bg-zinc-50 relative overflow-hidden flex items-center justify-center">
                {product.images?.[0] ? (
                  <img 
                    src={product.images[0]} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-700" 
                  />
                ) : (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-tr from-zinc-200 to-zinc-50 group-hover:scale-105 transition duration-700"></div>
                    <span className="relative z-10 text-zinc-400 font-medium">ไม่มีรูปภาพ</span>
                  </>
                )}
              </div>
              
              {/* ข้อมูล & ปุ่มกด */}
              <div className="p-6 flex flex-col flex-grow">
                <h2 className="text-lg font-bold text-zinc-900 mb-1 line-clamp-1">{product.name}</h2>
                <p className="text-zinc-500 text-sm mb-4 line-clamp-2 min-h-[40px]">{product.description}</p>
                <p className="text-2xl font-black text-zinc-900 mb-6">฿{product.price.toLocaleString()}</p>
                
                <button 
                  onClick={() => handleAddToCart(product)}
                  disabled={product.stock <= 0}
                  className="mt-auto w-full bg-zinc-100 hover:bg-zinc-950 text-zinc-900 hover:text-white font-medium py-3 rounded-xl transition-colors active:scale-[0.98] disabled:opacity-50 disabled:hover:bg-zinc-100 disabled:hover:text-zinc-900 disabled:cursor-not-allowed"
                >
                  {product.stock > 0 ? "เพิ่มลงตะกร้า" : "สินค้าหมด"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}