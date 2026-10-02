import { NextResponse } from "next/server";
import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import { auth } from "@/auth";

// ตั้งค่ากุญแจเชื่อมต่อ Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(req: Request) {
  try {
    // 1. ตรวจสอบ Login
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "กรุณาเข้าสู่ระบบก่อนอัปโหลดไฟล์" },
        { status: 401 }
      );
    }

    // 2. ตรวจสอบ Role
    const role = session.user.role;

    if (role !== "ADMIN" && role !== "AUTHOR") {
      return NextResponse.json(
        { error: "คุณไม่มีสิทธิ์อัปโหลดไฟล์" },
        { status: 403 }
      );
    }

    // 3. รับไฟล์จาก FormData
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "ไม่พบไฟล์รูปภาพ" },
        { status: 400 }
      );
    }

    // 4. ตรวจสอบประเภทไฟล์
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "อนุญาตเฉพาะไฟล์ JPG, PNG และ WEBP เท่านั้น",
        },
        { status: 400 }
      );
    }

    // 5. ตรวจสอบขนาดไฟล์
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "ขนาดไฟล์ต้องไม่เกิน 5 MB" },
        { status: 400 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json(
        { error: "ไฟล์ว่างเปล่า" },
        { status: 400 }
      );
    }

    // 6. แปลงไฟล์เป็น Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 7. ส่งไฟล์ขึ้น Cloudinary
    const result = await new Promise<UploadApiResponse>(
      (resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "mickey-hub",
            resource_type: "image",
          },
          (error, result) => {
            if (error) {
              reject(error);
              return;
            }

            if (!result) {
              reject(new Error("Cloudinary ไม่ส่งผลลัพธ์กลับมา"));
              return;
            }

            resolve(result);
          }
        );

        uploadStream.end(buffer);
      }
    );

    // 8. ส่ง URL รูปภาพกลับ
    return NextResponse.json({
      url: result.secure_url,
    });
  } catch (error: unknown) {
    console.error("Upload error:", error);

    return NextResponse.json(
      { error: "อัปโหลดรูปภาพล้มเหลว" },
      { status: 500 }
    );
  }
}