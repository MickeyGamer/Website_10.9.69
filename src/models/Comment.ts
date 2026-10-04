import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IComment extends Document {
  content: string;
  threadId: Types.ObjectId;
  author: Types.ObjectId;
  createdAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    content: { type: String, required: true },
    threadId: { type: Schema.Types.ObjectId, ref: "Thread", required: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export const Comment = (mongoose.models.Comment as Model<IComment>) || mongoose.model<IComment>("Comment", CommentSchema);