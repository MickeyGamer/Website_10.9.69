import mongoose, { Schema, Document, Model, Types } from "mongoose";
import slugify from "slugify";

export interface IPost extends Document {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  coverImage?: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  author: Types.ObjectId;
  category?: Types.ObjectId;
  readingTime: number;
}

const PostSchema = new Schema<IPost>(
  {
    title: { type: String, required: true },
    slug: { type: String, unique: true },
    excerpt: String,
    content: { type: String, required: true },
    coverImage: String,
    status: { type: String, enum: ["DRAFT", "PUBLISHED", "ARCHIVED"], default: "DRAFT" },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    category: { type: Schema.Types.ObjectId, ref: "Category" },
    readingTime: { type: Number, default: 1 },
  },
  { timestamps: true }
);

PostSchema.pre("validate", function () {
  if (this.isModified("title") && !this.slug) {
    const baseSlug = slugify(this.title, { lower: true, strict: true, locale: "th" });
    this.slug = baseSlug || `post-${Date.now()}`;
  }
  if (this.isModified("content")) {
    const words = this.content.replace(/<[^>]*>/g, "").split(/\s+/).length;
    this.readingTime = Math.max(1, Math.ceil(words / 200));
  }
});

export const Post = (mongoose.models.Post as Model<IPost>) || mongoose.model<IPost>("Post", PostSchema);