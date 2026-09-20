import mongoose, { Schema, Document, Model, Types } from "mongoose";

// 1. เพิ่ม room เข้าไปใน Interface
export interface IThread extends Document {
  title: string;
  content: string;
  author: Types.ObjectId;
  room: string; // [เพิ่มใหม่] ฟิลด์ห้อง
  views: number;
  repliesCount: number;
}

const ThreadSchema = new Schema<IThread>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    
    // 2. เพิ่ม room เข้าไปใน Schema พร้อมกำหนดเงื่อนไข (enum)
    room: { 
      type: String, 
      required: true,
      enum: ["พูดคุยทั่วไป", "ไอที & เน็ตเวิร์ก", "เขียนโปรแกรม", "รีวิวสินค้า"],
      default: "พูดคุยทั่วไป"
    },

    views: { type: Number, default: 0 },
    repliesCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Thread = (mongoose.models.Thread as Model<IThread>) || mongoose.model<IThread>("Thread", ThreadSchema);