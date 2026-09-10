import mongoose from 'mongoose';
// หากคุณ export default 
import { Post } from '@/models/Post'; 

// 1. อัปเดต Interface หลักของคุณให้มี createdAt และ updatedAt
export interface IPost {
  title: string;
  slug: string;
  content: string;
  status: string;
  // ค่าดั้งเดิมใน Schema จะเป็นแค่ ObjectId
  author: mongoose.Types.ObjectId;
  category: mongoose.Types.ObjectId;
  
  // เพิ่ม 2 บรรทัดนี้เพื่อแก้ Error 'createdAt'
  createdAt?: Date; 
  updatedAt?: Date; 
}

// 2. สร้าง Type ใหม่สำหรับ Post ที่ถูก .populate() ดึงข้อมูลมาแล้ว
export type PopulatedPost = Omit<IPost, 'author' | 'category'> & {
  // บอก TypeScript ว่าตอนนี้ author และ category มี property 'name' แล้ว
  author: { _id: mongoose.Types.ObjectId; name: string };
  category: { _id: mongoose.Types.ObjectId; name: string };
};

// 3. ตอน Query ให้ใส่ as unknown as PopulatedPost ต่อท้าย .lean()
export async function getPostBySlug(slug: string) {
  const post = await Post.findOne({ slug, status: "PUBLISHED" })
    .populate("author", "name")
    .populate("category", "name")
    .lean() as unknown as PopulatedPost; // แก้ Error 'name' does not exist on type 'ObjectId'

  return post;
}