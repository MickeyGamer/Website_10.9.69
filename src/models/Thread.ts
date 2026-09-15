import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IThread extends Document {
  title: string;
  content: string;
  author: Types.ObjectId;
  views: number;
  repliesCount: number;
}

const ThreadSchema = new Schema<IThread>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    views: { type: Number, default: 0 },
    repliesCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Thread = (mongoose.models.Thread as Model<IThread>) || mongoose.model<IThread>("Thread", ThreadSchema);