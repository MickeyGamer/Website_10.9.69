import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IComment extends Document {
  thread: Types.ObjectId;
  author: Types.ObjectId;
  content: string;
}

const CommentSchema = new Schema<IComment>(
  {
    thread: { type: Schema.Types.ObjectId, ref: "Thread", required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

export const Comment = (mongoose.models.Comment as Model<IComment>) || mongoose.model<IComment>("Comment", CommentSchema);