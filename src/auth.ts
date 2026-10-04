import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs"; // 1. นำเข้า bcryptjs มาใช้เทียบรหัสผ่าน
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" }, 
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        console.log("--- 🕵️‍♂️ เริ่มตรวจสอบการล็อกอิน ---");
        console.log("1. อีเมลที่พยายามเข้าสู่ระบบ:", credentials?.email);

        if (!credentials?.email || !credentials?.password) {
          console.log("❌ ล้มเหลว: ไม่ได้รับอีเมลหรือรหัสผ่านจากหน้าฟอร์ม");
          return null;
        }

        try {
          await connectDB();
          console.log("2. เชื่อมต่อฐานข้อมูล MongoDB สำเร็จ");

          const user = await User.findOne({ email: credentials.email }).select("+password");
          
          if (!user) {
            console.log("❌ ล้มเหลว: ค้นหาอีเมลนี้ใน Database ไม่เจอเลย (สมัครหรือยัง?)");
            return null;
          }
          console.log("3. เจอข้อมูล User ในระบบแล้ว (ชื่อ:", user.name, ")");

          if (!user.password) {
            console.log("❌ ล้มเหลว: User นี้มีในระบบ แต่ไม่มีฟิลด์รหัสผ่านบันทึกไว้");
            return null;
          }

          const isPasswordMatch = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

          if (!isPasswordMatch) {
            console.log("❌ ล้มเหลว: ถอดรหัสเทียบแล้ว รหัสผ่านผิด!");
            return null;
          }

          console.log("✅ สำเร็จ: รหัสผ่านถูกต้อง! ปล่อยผ่านได้");
          console.log("--------------------------------");
          
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
          };
        } catch (error) {
          console.error("🚨 ระบบพัง (System Error):", error);
          return null;
        }
      }
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string;
        (session.user as any).role = token.role as string;
      }
      return session;
    },
  },
});