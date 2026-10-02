import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  category: string;
  isActive: boolean;

  // Virtual
  inStock: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    // ==========================================
    // ชื่อสินค้า
    // ==========================================
    name: {
      type: String,
      required: [true, "กรุณาระบุชื่อสินค้า"],
      trim: true,
      minlength: [1, "ชื่อสินค้าต้องมีอย่างน้อย 1 ตัวอักษร"],
      maxlength: [200, "ชื่อสินค้าต้องไม่เกิน 200 ตัวอักษร"],
    },

    // ==========================================
    // Slug
    // ==========================================
    slug: {
      type: String,
      required: [true, "กรุณาระบุ slug"],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },

    // ==========================================
    // รายละเอียดสินค้า
    // ==========================================
    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: [5000, "รายละเอียดสินค้าต้องไม่เกิน 5,000 ตัวอักษร"],
    },

    // ==========================================
    // ราคา
    // ==========================================
    price: {
      type: Number,
      required: [true, "กรุณาระบุราคาสินค้า"],
      min: [0, "ราคาสินค้าต้องไม่ติดลบ"],
    },

    // ==========================================
    // จำนวนสินค้า
    // ==========================================
    stock: {
      type: Number,
      default: 0,
      min: [0, "จำนวนสินค้าต้องไม่ติดลบ"],
      validate: {
        validator: Number.isInteger,
        message: "จำนวนสินค้าต้องเป็นจำนวนเต็ม",
      },
    },

    // ==========================================
    // รูปภาพสินค้า
    // ==========================================
    images: {
      type: [String],
      default: [],
      validate: {
        validator: (images: string[]) => images.length <= 10,
        message: "สามารถเพิ่มรูปสินค้าได้สูงสุด 10 รูป",
      },
    },

    // ==========================================
    // หมวดหมู่
    // ==========================================
    category: {
      type: String,
      default: "",
      trim: true,
      maxlength: [100, "หมวดหมู่ต้องไม่เกิน 100 ตัวอักษร"],
      index: true,
    },

    // ==========================================
    // สถานะสินค้า
    // ==========================================
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// ==========================================
// INDEX
// ==========================================

ProductSchema.index({
  isActive: 1,
  createdAt: -1,
});

ProductSchema.index({
  category: 1,
  isActive: 1,
});

// ==========================================
// VIRTUAL
// ตรวจสอบว่าสินค้ามีของพร้อมขายหรือไม่
// ==========================================

ProductSchema.virtual("inStock").get(function () {
  return this.stock > 0 && this.isActive;
});

// ==========================================
// ให้ Virtual แสดงใน JSON
// ==========================================

ProductSchema.set("toJSON", {
  virtuals: true,
});

ProductSchema.set("toObject", {
  virtuals: true,
});

// ==========================================
// MODEL
// ==========================================

export const Product =
  (mongoose.models.Product as Model<IProduct>) ||
  mongoose.model<IProduct>("Product", ProductSchema);