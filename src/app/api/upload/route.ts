import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// ตั้งค่ากุญแจเชื่อมต่อ Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  try {
    // 1. รับไฟล์จาก FormData ที่ส่งมาจากหน้าเว็บ
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "ไม่พบไฟล์รูปภาพ" }, { status: 400 });
    }

    // 2. แปลงไฟล์เป็น Buffer เพื่อเตรียมส่งขึ้น Cloud
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 3. ส่งไฟล์ขึ้น Cloudinary ผ่าน Stream (เหมาะกับ Next.js App Router)
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "mickey-hub" }, // ชื่อโฟลเดอร์ใน Cloudinary
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    // 4. ส่ง URL รูปภาพของจริงกลับไปให้หน้าเว็บใช้งาน
    return NextResponse.json({ url: (result as any).secure_url });
  } catch (error: any) {
    return NextResponse.json({ error: "อัปโหลดรูปล้มเหลว: " + error.message }, { status: 500 });
  }
}