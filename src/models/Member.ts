import mongoose, { Model, Schema } from "mongoose";

// สมาชิกแต่ละคน ฝังอยู่ในเอกสาร Group (ไม่ใช่ collection แยก)
export interface IGroupMember {
  name: string;
  role: string;
  description: string;
  skills: string[];
  avatar?: string; // Cloudinary URL รูปประจำตัว
  order?: number;
}

export interface IGroup {
  name: string;
  description: string;
  logo?: string; // Cloudinary URL
  coverImage?: string; // Cloudinary URL
  foundedYear: number;
  members: IGroupMember[];
  createdAt?: Date;
  updatedAt?: Date;
}

const groupMemberSchema = new Schema<IGroupMember>(
  {
    name: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    skills: { type: [String], default: [] },
    avatar: { type: String },
    order: { type: Number, default: 0 },
  },
  { _id: true } // แต่ละสมาชิกมี _id ของตัวเอง ใช้ตอนแก้ไข/ลบทีหลังได้
);

const groupSchema = new Schema<IGroup>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    logo: { type: String },
    coverImage: { type: String },
    foundedYear: { type: Number, required: true },
    members: { type: [groupMemberSchema], default: [] },
  },
  { timestamps: true }
);

const Group: Model<IGroup> =
  mongoose.models.Group || mongoose.model<IGroup>("Group", groupSchema);

export default Group;