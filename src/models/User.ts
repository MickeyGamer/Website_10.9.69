import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";

export type UserRole = "ADMIN" | "AUTHOR" | "USER";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  comparePassword(plain: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 255,
    },

    password: {
      type: String,
      required: true,
      select: false,
      minlength: 6,
    },

    role: {
      type: String,
      enum: ["ADMIN", "AUTHOR", "USER"],
      default: "USER",
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 12);
});

UserSchema.methods.comparePassword = async function (
  plain: string
): Promise<boolean> {
  if (!this.password) {
    return false;
  }

  return bcrypt.compare(plain, this.password);
};

export const User =
  (mongoose.models.User as Model<IUser>) ||
  mongoose.model<IUser>("User", UserSchema);