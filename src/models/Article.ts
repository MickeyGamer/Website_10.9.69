import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IArticle extends Document {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  coverImage?: string;
  category?: string;

  author: Types.ObjectId;

  status: "DRAFT" | "PENDING" | "PUBLISHED" | "REJECTED";

  publishedAt?: Date | null;

  createdAt: Date;
  updatedAt: Date;
}

const ArticleSchema = new Schema<IArticle>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 220,
    },

    excerpt: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    content: {
      type: String,
      required: true,
      default: "",
    },

    coverImage: {
      type: String,
      trim: true,
      default: "",
    },

    category: {
      type: String,
      trim: true,
      default: "ทั่วไป",
    },

    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["DRAFT", "PENDING", "PUBLISHED", "REJECTED"],
      default: "DRAFT",
      index: true,
    },

    publishedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// ค้นหาตามสถานะ + วันที่สร้าง
ArticleSchema.index({ status: 1, createdAt: -1 });

// ป้องกัน Model ถูกสร้างซ้ำใน Next.js
export const Article =
  (mongoose.models.Article as Model<IArticle>) ||
  mongoose.model<IArticle>("Article", ArticleSchema);