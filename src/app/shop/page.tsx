"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useCartStore } from "@/store/CartStore";
import Link from "next/link";

export default function ShopPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // ดึงฟังก์ชันมาจาก Zustand
  const addItem = useCartStore(state => state.addItem);
  const cartItems = useCartStore(state => state.items);

  // คำนวณจำนวนชิ้นในตะกร้า
  const totalCartItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    // ดึงข้อมูลสินค้า (จำลองข้อมูลไปก่อนจนกว่าเราจะทำหน้าแอดมินเพิ่มสินค้า)
    const mockProducts = [
      { _id: "1", name: "เสื้อยืด Minimalist Black", price: 590, slug: "t-shirt-black", images: [""] },
      { _id: "2", name: "แก้วกาแฟพรีเมียม Matte White", price: 450, slug: "coffee-mug-white", images: [""] },
      { _id: "3", name: "กระเป๋าผ้า Canvas รุ่นลดโลกร้อน", price: 390, slug: "canvas-bag", images: [""] },
    ];
    setProducts(mockProducts);
    setLoading(false);
  }, []);

  const handleAddToCart = (product: any) => {
    addItem(product);
    toast.success(`เพิ่ม ${product.name} ลงตะกร้าแล้ว`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">ร้านค้า (Shop)</h1>
          <p className="text-gray-500 mt-2">สินค้าพรีเมียมคัดสรรพิเศษสำหรับคุณ</p>
        </div>
        
        {/* ปุ่มไปหน้าตะกร้าสินค้า */}
        <Link 
          href="/cart" 
          className="relative bg-white border border-gray-200 text-gray-900 font-semibold px-6 py-3 rounded-2xl hover:border-gray-900 transition flex items-center gap-2 shadow-sm"
        >
          <span>🛒 ตะกร้าของฉัน</span>
          {totalCartItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-zinc-900 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full animate-bounce">
              {totalCartItems}
            </span>
          )}
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => (
          <div key={product._id} className="group flex flex-col bg-white rounded-3xl overflow-hidden shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04)] hover:shadow-xl transition-all duration-300 border border-gray-100">
            {/* รูปสินค้า */}
            <div className="aspect-[4/5] bg-gray-100 relative overflow-hidden flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-tr from-gray-200 to-gray-50 group-hover:scale-105 transition duration-700"></div>
              <span className="relative z-10 text-gray-400 font-medium">รูปภาพสินค้า</span>
            </div>
            
            {/* ข้อมูล & ปุ่มกด */}
            <div className="p-6 flex flex-col flex-grow">
              <h2 className="text-lg font-bold text-gray-900 mb-1">{product.name}</h2>
              <p className="text-xl font-black text-blue-600 mb-6">฿{product.price.toLocaleString()}</p>
              
              <button 
                onClick={() => handleAddToCart(product)}
                className="mt-auto w-full bg-zinc-100 hover:bg-zinc-950 text-zinc-900 hover:text-white font-medium py-3 rounded-xl transition-colors active:scale-[0.98]"
              >
                เพิ่มลงตะกร้า
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}