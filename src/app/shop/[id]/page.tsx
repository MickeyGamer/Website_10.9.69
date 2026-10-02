import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { connectDB } from "@/lib/mongodb";
import { Product } from "@/models/Product";
import ProductActions from "@/app/shop/ProductActions";

export const dynamic = "force-dynamic";

interface ProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductDetailPage({
  params,
}: ProductPageProps) {
  const { id } = await params;

  await connectDB();

  const product = await Product.findById(id).lean();

  if (!product) {
    notFound();
  }

  const productId = product._id.toString();

  return (
    <main className="min-h-screen bg-zinc-50">
      {/* =========================
          Breadcrumb
      ========================= */}
      <div className="max-w-6xl mx-auto px-4 pt-8">
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <Link
            href="/shop"
            className="hover:text-zinc-950 transition"
          >
            ร้านค้า
          </Link>

          <span>›</span>

          <span className="text-zinc-900 font-medium line-clamp-1">
            {product.name}
          </span>
        </div>
      </div>

      {/* =========================
          Product Detail
      ========================= */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* =========================
              รูปสินค้า
          ========================= */}
          <div>
            <div className="relative aspect-square bg-white rounded-3xl overflow-hidden border border-zinc-200 shadow-sm">

              {product.images?.[0] ? (
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  priority
                  className="object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-tr from-zinc-200 to-zinc-50">
                  <span className="text-zinc-400">
                    ไม่มีรูปภาพสินค้า
                  </span>
                </div>
              )}

              {/* สถานะสินค้า */}
              {product.stock <= 0 ? (
                <span className="absolute top-5 left-5 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow">
                  สินค้าหมด
                </span>
              ) : product.stock <= 5 ? (
                <span className="absolute top-5 left-5 bg-orange-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow">
                  🔥 เหลือ {product.stock} ชิ้น
                </span>
              ) : (
                <span className="absolute top-5 left-5 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow">
                  ✓ มีสินค้า
                </span>
              )}
            </div>

            {/* รูปเพิ่มเติม */}
            {product.images?.length > 1 && (
              <div className="grid grid-cols-4 gap-3 mt-4">
                {product.images.slice(0, 4).map(
                  (image: string, index: number) => (
                    <div
                      key={`${image}-${index}`}
                      className="relative aspect-square rounded-xl overflow-hidden bg-white border border-zinc-200"
                    >
                      <Image
                        src={image}
                        alt={`${product.name} รูปที่ ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )
                )}
              </div>
            )}
          </div>

          {/* =========================
              ข้อมูลสินค้า
          ========================= */}
          <div className="flex flex-col">

            <span className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
              MICKEYHUB STORE
            </span>

            <h1 className="text-4xl md:text-5xl font-black text-zinc-950 mt-3 tracking-tight">
              {product.name}
            </h1>

            {/* ราคา */}
            <div className="mt-6">
              <p className="text-sm text-zinc-400">
                ราคาสินค้า
              </p>

              <p className="text-4xl font-black text-zinc-950">
                ฿{product.price.toLocaleString()}
              </p>
            </div>

            <div className="h-px bg-zinc-200 my-7" />

            {/* รายละเอียด */}
            <div>
              <h2 className="text-lg font-bold text-zinc-900 mb-3">
                รายละเอียดสินค้า
              </h2>

              <p className="text-zinc-600 leading-7 whitespace-pre-line">
                {product.description || "ไม่มีรายละเอียดสินค้า"}
              </p>
            </div>

            {/* Stock */}
            <div className="mt-7 bg-zinc-100 rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">
                  สถานะสินค้า
                </span>

                <span
                  className={
                    product.stock > 0
                      ? "font-bold text-green-600"
                      : "font-bold text-red-600"
                  }
                >
                  {product.stock > 0
                    ? `มีสินค้า ${product.stock} ชิ้น`
                    : "สินค้าหมด"}
                </span>
              </div>
            </div>

            {/* =========================
                ปุ่มซื้อสินค้า
            ========================= */}
            <ProductActions
              product={{
                _id: productId,
                name: product.name,
                price: product.price,
                description: product.description || "",
                images: product.images || [],
                stock: product.stock,
              }}
            />

          </div>
        </div>
      </section>

      {/* =========================
          Reviews
      ========================= */}
      <section className="max-w-6xl mx-auto px-4 pb-16">

        <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">

          {/* Header */}
          <div className="p-6 md:p-8 border-b border-zinc-100">

            <span className="text-sm text-zinc-400">
              CUSTOMER REVIEWS
            </span>

            <h2 className="text-2xl font-black text-zinc-950 mt-1">
              💬 ความคิดเห็นเกี่ยวกับสินค้า
            </h2>

            <p className="text-zinc-500 mt-1">
              อ่านความคิดเห็นและประสบการณ์จากผู้ซื้อ
            </p>

          </div>

          {/* Review */}
          <div className="p-6 md:p-8">

            <div className="text-center py-12 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">

              <div className="text-5xl mb-4">
                💬
              </div>

              <h3 className="text-lg font-bold text-zinc-900">
                ยังไม่มีความคิดเห็น
              </h3>

              <p className="text-sm text-zinc-500 mt-2">
                เมื่อมีผู้ซื้อแสดงความคิดเห็น
                จะแสดงข้อมูลบริเวณนี้
              </p>

            </div>

          </div>

        </div>

      </section>
    </main>
  );
}