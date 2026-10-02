export type Product = {
  _id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  images?: string[];
  category?: string;
  isActive: boolean;
};

export async function fetchProducts(): Promise<Product[]> {
  try {
    const res = await fetch("/api/products", {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(
        `โหลดสินค้าไม่สำเร็จ (${res.status})`
      );
    }

    const data = await res.json();

    if (!Array.isArray(data)) {
      throw new Error(
        "ข้อมูลสินค้าที่ได้รับไม่ใช่ Array"
      );
    }

    // แสดงเฉพาะสินค้าที่เปิดขาย
    return data.filter(
      (product: Product) => product.isActive === true
    );
  } catch (error) {
    console.error("fetchProducts error:", error);

    throw new Error(
      "ไม่สามารถโหลดข้อมูลสินค้าได้"
    );
  }
}