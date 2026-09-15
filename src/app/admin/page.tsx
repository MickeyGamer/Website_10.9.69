"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State สำหรับควบคุม Popup ยืนยันการลบ
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);

  // ดึงข้อมูลบทความแบบ Client-side เพื่อให้กดลบแล้วรีเฟรชตารางได้ทันที
  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/posts"); // เดี๋ยวเราทำ API GET รวมไว้ หรือดึงตรงก็ได้
      // เพื่อความง่าย ในที่นี้เราจะดึงผ่าน Server Action หรือสร้าง API GET /api/posts เผื่อไว้
      // หรือใช้การดึงตรงใน Component นี้ด้วย useEffect
    } catch (e) {
      console.error(e);
    }
  };

  // เนื่องจากเราใช้ Server Component เดิมอยู่ ให้เราเขียนแบบผสมผสาน หรือดึงผ่าน API 
  // แนะนำให้สร้างไฟล์ API สำหรับ GET รายการบทความหลังบ้านด้วยครับ
  return (
    <div>...</div>
  );
}