"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";

import { useCartStore } from "@/store/CartStore";
import {
  fetchProducts,
  type Product,
} from "@/lib/fetchProducts";

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // =========================
  // ตัวกรอง / ค้นหา
  // =========================
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("default");
  const [stockFilter, setStockFilter] = useState("all");

  // =========================
  // Zustand Cart
  // =========================
  const addItem = useCartStore((state) => state.addItem);
  const cartItems = useCartStore((state) => state.items);

  const totalCartItems = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  // =========================
  // โหลดสินค้า
  // =========================
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProducts();
        setProducts(data);
      } catch (error) {
        console.error("Shop fetch error:", error);
        toast.error("โหลดข้อมูลสินค้าล้มเหลว");
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // =========================
  // เพิ่มลงตะกร้า
  // =========================
  const handleAddToCart = (product: Product) => {
    addItem(product);
    toast.success(`เพิ่ม ${product.name} ลงตะกร้าแล้ว`);
  };

  // =========================
  // ค้นหา + Filter + Sort
  // =========================
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // ค้นหา
    if (search.trim()) {
      const keyword = search.toLowerCase();

      result = result.filter(
        (product) =>
          product.name.toLowerCase().includes(keyword) ||
          product.description?.toLowerCase().includes(keyword)
      );
    }

    // กรอง Stock
    if (stockFilter === "available") {
      result = result.filter((product) => product.stock > 0);
    }

    if (stockFilter === "low") {
      result = result.filter(
        (product) => product.stock > 0 && product.stock <= 5
      );
    }

    // เรียง
    if (sort === "price-low") {
      result.sort((a, b) => a.price - b.price);
    }

    if (sort === "price-high") {
      result.sort((a, b) => b.price - a.price);
    }

    if (sort === "name") {
      result.sort((a, b) =>
        a.name.localeCompare(b.name, "th")
      );
    }

    return result;
  }, [products, search, sort, stockFilter]);

  return (
    <div className="min-h-screen bg-zinc-50">

      {/* =========================
          HERO SHOP
      ========================= */}
      <section className="bg-zinc-950 text-white">
        <div className="max-w-6xl mx-auto px-4 py-16">

          <div className="max-w-2xl">
            <span className="inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-zinc-200 mb-5">
              🛍️ MickeyHub Store
            </span>

            <h1 className="text-4xl md:text-5xl font-black tracking-tight">
              ร้านค้าออนไลน์
            </h1>

            <p className="mt-4 text-zinc-400 text-lg">
              ค้นหาสินค้าที่คุณชอบ
              และเลือกซื้อได้ง่ายภายในเว็บไซต์
            </p>
          </div>

          {/* สถิติ */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-10">

            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <p className="text-zinc-400 text-sm">
                สินค้าทั้งหมด
              </p>

              <p className="text-2xl font-black mt-1">
                {products.length}
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <p className="text-zinc-400 text-sm">
                สินค้าที่พบ
              </p>

              <p className="text-2xl font-black mt-1">
                {filteredProducts.length}
              </p>
            </div>

            <Link
              href="/cart"
              className="bg-white text-zinc-950 rounded-2xl p-5 hover:bg-zinc-200 transition"
            >
              <p className="text-zinc-500 text-sm">
                ตะกร้าสินค้า
              </p>

              <p className="text-2xl font-black mt-1">
                🛒 {totalCartItems}
              </p>
            </Link>

          </div>

        </div>
      </section>

      <main className="max-w-6xl mx-auto px-4 py-10">

        {/* =========================
            SEARCH + FILTER
        ========================= */}
        <section className="bg-white border border-zinc-200 rounded-3xl p-5 md:p-6 shadow-sm mb-10">

          <div className="flex flex-col lg:flex-row gap-4">

            {/* Search */}
            <div className="flex-1">

              <label className="block text-sm font-semibold text-zinc-700 mb-2">
                🔎 ค้นหาสินค้า
              </label>

              <div className="relative">

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ค้นหาชื่อสินค้า หรือรายละเอียด..."
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none transition focus:border-zinc-950 focus:bg-white"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900"
                  >
                    ✕
                  </button>
                )}

              </div>

            </div>

            {/* Sort */}
            <div className="lg:w-56">

              <label className="block text-sm font-semibold text-zinc-700 mb-2">
                ↕️ เรียงสินค้า
              </label>

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none focus:border-zinc-950"
              >
                <option value="default">
                  เรียงตามค่าเริ่มต้น
                </option>

                <option value="price-low">
                  ราคาต่ำ → สูง
                </option>

                <option value="price-high">
                  ราคาสูง → ต่ำ
                </option>

                <option value="name">
                  ชื่อสินค้า A → Z
                </option>
              </select>

            </div>

            {/* Stock */}
            <div className="lg:w-56">

              <label className="block text-sm font-semibold text-zinc-700 mb-2">
                📦 สถานะสินค้า
              </label>

              <select
                value={stockFilter}
                onChange={(e) =>
                  setStockFilter(e.target.value)
                }
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 outline-none focus:border-zinc-950"
              >
                <option value="all">
                  สินค้าทั้งหมด
                </option>

                <option value="available">
                  มีสินค้า
                </option>

                <option value="low">
                  ใกล้หมด
                </option>
              </select>

            </div>

          </div>

        </section>

        {/* =========================
            RESULT HEADER
        ========================= */}
        {!loading && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">

            <div>
              <h2 className="text-2xl font-black text-zinc-900">
                สินค้าทั้งหมด
              </h2>

              <p className="text-sm text-zinc-500 mt-1">
                พบสินค้า {filteredProducts.length} รายการ
              </p>
            </div>

            {search && (
              <div className="text-sm text-zinc-500">
                ผลการค้นหา:{" "}
                <span className="font-semibold text-zinc-900">
                  {search}
                </span>
              </div>
            )}

          </div>
        )}

        {/* =========================
            LOADING
        ========================= */}
        {loading ? (

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">

            {[1, 2, 3, 4, 5, 6].map((item) => (

              <div
                key={item}
                className="bg-white rounded-3xl overflow-hidden border border-zinc-100 animate-pulse"
              >

                <div className="aspect-[4/5] bg-zinc-200" />

                <div className="p-6 space-y-4">

                  <div className="h-5 bg-zinc-200 rounded-lg w-3/4" />

                  <div className="h-4 bg-zinc-200 rounded-lg w-full" />

                  <div className="h-4 bg-zinc-200 rounded-lg w-2/3" />

                  <div className="h-8 bg-zinc-200 rounded-lg w-1/3" />

                  <div className="h-12 bg-zinc-200 rounded-xl" />

                </div>

              </div>

            ))}

          </div>

        ) : filteredProducts.length === 0 ? (

          /* =========================
              NO PRODUCT
          ========================= */
          <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-zinc-200">

            <div className="text-6xl mb-5">
              🔍
            </div>

            <h2 className="text-2xl font-black text-zinc-900">
              ไม่พบสินค้าที่ค้นหา
            </h2>

            <p className="text-zinc-500 mt-2">
              ลองเปลี่ยนคำค้นหาหรือปรับตัวกรองสินค้า
            </p>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSort("default");
                setStockFilter("all");
              }}
              className="mt-6 bg-zinc-950 text-white px-6 py-3 rounded-xl font-semibold hover:bg-zinc-800 transition"
            >
              ล้างตัวกรอง
            </button>

          </div>

        ) : (

          /* =========================
              PRODUCT GRID
          ========================= */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">

            {filteredProducts.map((product) => (

              <article
                key={product._id}
                className="group flex flex-col bg-white rounded-3xl overflow-hidden border border-zinc-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
              >

                {/* รูปสินค้า */}
                <div className="aspect-[4/5] bg-zinc-100 relative overflow-hidden">

                  {product.images?.[0] ? (

                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />

                  ) : (

                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-tr from-zinc-200 to-zinc-50">
                      <span className="text-zinc-400">
                        ไม่มีรูปภาพ
                      </span>
                    </div>

                  )}

                  {/* Badge */}
                  {product.stock <= 5 &&
                    product.stock > 0 && (
                      <span className="absolute top-4 left-4 bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow">
                        🔥 เหลือ {product.stock} ชิ้น
                      </span>
                    )}

                  {product.stock <= 0 && (
                    <span className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow">
                      สินค้าหมด
                    </span>
                  )}

                </div>

                {/* ข้อมูล */}
                <div className="p-6 flex flex-col flex-grow">

                  <h2 className="text-xl font-black text-zinc-900 line-clamp-1">
                    {product.name}
                  </h2>

                  <p className="text-zinc-500 text-sm mt-2 mb-5 line-clamp-2 min-h-[40px]">
                    {product.description}
                  </p>

                  <div className="flex items-end justify-between gap-4 mb-5">

                    <div>
                      <p className="text-xs text-zinc-400">
                        ราคา
                      </p>

                      <p className="text-2xl font-black text-zinc-950">
                        ฿{product.price.toLocaleString()}
                      </p>
                    </div>

                    {product.stock > 0 && (
                      <span className="text-xs text-zinc-400">
                        เหลือ {product.stock} ชิ้น
                      </span>
                    )}

                  </div>

                  {/* Buttons */}
                  <div className="grid grid-cols-2 gap-3 mt-auto">

                    <Link
                      href={`/shop/${product._id}`}
                      className="flex items-center justify-center rounded-xl border border-zinc-200 py-3 font-semibold text-zinc-700 hover:bg-zinc-100 transition"
                    >
                      ดูรายละเอียด
                    </Link>

                    <button
                      type="button"
                      onClick={() =>
                        handleAddToCart(product)
                      }
                      disabled={product.stock <= 0}
                      className="rounded-xl bg-zinc-950 text-white py-3 font-semibold hover:bg-zinc-800 transition active:scale-[0.98] disabled:bg-zinc-200 disabled:text-zinc-400 disabled:cursor-not-allowed"
                    >
                      {product.stock > 0
                        ? "🛒 เพิ่มตะกร้า"
                        : "สินค้าหมด"}
                    </button>

                  </div>

                </div>

              </article>

            ))}

          </div>

        )}

      </main>

    </div>
  );
}