"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

// กำหนด Type ให้ตรงกับ Database ของเรา
interface IThread {
  _id: string;
  title: string;
  room: string;
  author: { name: string } | null;
  createdAt: string;
}

export default function BoardPage() {
  const { data: session } = useSession();
  const [threads, setThreads] = useState<IThread[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State สำหรับแท็บห้องที่ถูกเลือก (เริ่มต้นที่หน้า "ทั้งหมด")
  const [activeTab, setActiveTab] = useState("ทั้งหมด");

  const rooms = ["ทั้งหมด", "พูดคุยทั่วไป", "ไอที & เน็ตเวิร์ก", "เขียนโปรแกรม", "รีวิวสินค้า"];

  // ดึงข้อมูลกระทู้ทั้งหมดจาก API
  useEffect(() => {
    const fetchThreads = async () => {
      try {
        const res = await fetch("/api/threads");
        if (!res.ok) throw new Error("ดึงข้อมูลไม่สำเร็จ");
        const data = await res.json();
        setThreads(data);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchThreads();
  }, []);

  // ฟิลเตอร์กระทู้ตามแท็บที่เลือก
  const filteredThreads = activeTab === "ทั้งหมด" 
    ? threads 
    : threads.filter(thread => thread.room === activeTab);

  return (
    <div className="min-h-screen bg-zinc-50 pt-24 pb-12 px-4">
      <div className="max-w-5xl mx-auto">
        
        {/* ส่วนหัว Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-black text-zinc-900 tracking-tight mb-2">เว็บบอร์ด <span className="text-blue-600">MickeyHub</span></h1>
            <p className="text-zinc-500">พื้นที่พูดคุย แบ่งปันความรู้ และรีวิวสินค้าไอที</p>
          </div>
          
          <Link 
            href="/board/new" 
            className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 whitespace-nowrap active:scale-[0.98]"
          >
            <span>✍️</span> ตั้งกระทู้ใหม่
          </Link>
        </div>

        {/* แถบ Tabs เลือกห้อง */}
        <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-6 pb-2">
          {rooms.map((room) => (
            <button
              key={room}
              onClick={() => setActiveTab(room)}
              className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                activeTab === room 
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20" 
                  : "bg-white text-zinc-500 hover:bg-zinc-100 border border-zinc-200"
              }`}
            >
              {room}
            </button>
          ))}
        </div>

        {/* กล่องแสดงรายการกระทู้ */}
        <div className="bg-white rounded-3xl border border-zinc-100 shadow-[0_5px_20px_rgb(0,0,0,0.02)] overflow-hidden">
          
          {isLoading ? (
            <div className="py-20 text-center text-zinc-400 font-medium animate-pulse">
              กำลังโหลดกระทู้...
            </div>
          ) : filteredThreads.length === 0 ? (
            <div className="py-20 text-center text-zinc-400 font-medium">
              ยังไม่มีกระทู้ในหมวดหมู่นี้ 🥺<br/>มาตั้งกระทู้แรกกันเถอะ!
            </div>
          ) : (
            <div className="flex flex-col">
              {filteredThreads.map((thread) => (
                <Link 
                  href={`/board/${thread._id}`} 
                  key={thread._id}
                  className="group p-6 border-b border-zinc-100 last:border-0 hover:bg-zinc-50/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-zinc-100 text-zinc-600 px-2 py-1 rounded-md">
                        {thread.room}
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-zinc-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {thread.title}
                    </h2>
                    <div className="flex items-center gap-2 mt-2 text-xs text-zinc-500">
                      <span className="font-bold">{thread.author?.name || "ผู้ไม่ประสงค์ออกนาม"}</span>
                      <span>•</span>
                      <span>{new Date(thread.createdAt).toLocaleDateString("th-TH", { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>
                  
                  {/* ปุ่มอ่านกระทู้ (แสดงตอน Hover) */}
                  <div className="hidden md:flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-blue-600 font-bold text-sm bg-blue-50 px-4 py-2 rounded-xl">
                      อ่านกระทู้ →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}