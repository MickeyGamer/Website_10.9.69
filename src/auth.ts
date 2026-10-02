// src/auth.ts

import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";

export const {
  handlers,
  auth,
  signIn,
  signOut,
} = NextAuth({
  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/login",
  },

  providers: [
    CredentialsProvider({
      name: "Credentials",

      credentials: {
        email: {
          label: "Email",
          type: "email",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        try {
          const email = String(
            credentials?.email ?? ""
          )
            .trim()
            .toLowerCase();

          const password = String(
            credentials?.password ?? ""
          );

          if (!email || !password) {
            return null;
          }

          // เชื่อมต่อ MongoDB
          await connectDB();

          // ค้นหา User
          // password ถูกตั้ง select: false ใน User.ts
          // จึงต้องใช้ +password
          const user = await User.findOne({
            email,
          }).select("+password");

          if (!user) {
            return null;
          }

          // ตรวจสอบ Password
          const passwordValid =
            await user.comparePassword(password);

          if (!passwordValid) {
            return null;
          }

          // ส่งข้อมูลกลับให้ Auth.js
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
          };
        } catch (error) {
          console.error(
            "Authorize error:",
            error
          );

          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id);

        session.user.role =
          (token.role as
            | "ADMIN"
            | "AUTHOR"
            | "USER") ?? "USER";
      }

      return session;
    },
  },

  secret: process.env.AUTH_SECRET,
});