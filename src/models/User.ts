import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: "ADMIN" | "AUTHOR" | "USER";
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, select: false },
    role: { type: String, enum: ["ADMIN", "AUTHOR", "USER"], default: "USER" },
  },
  { timestamps: true }
);

export const User = (mongoose.models.User as Model<IUser>) || mongoose.model<IUser>("User", UserSchema);