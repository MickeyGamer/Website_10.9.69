// src/types/next-auth.d.ts

import type { DefaultSession } from "next-auth";
import type { Role } from "@/lib/rbac";

declare module "next-auth" {
  /**
   * ข้อมูล User ที่ส่งผ่านฟังก์ชัน authorize() กลับมาเก็บไว้ใน Session/JWT
   */
  interface User {
    id: string;
    role: Role;
  }

  /**
   * ข้อมูล Session ที่ใช้งานผ่าน auth() หรือ useSession()
   */
  interface Session {
    user: {
      id: string;
      role: Role;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  /**
   * โครงสร้างข้อมูลที่เก็บไว้ภายใน JSON Web Token (JWT)
   */
  interface JWT {
    id: string;
    role: Role;
  }
}

export {};