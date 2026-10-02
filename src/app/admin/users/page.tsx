"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

type UserRole = "ADMIN" | "AUTHOR" | "USER";

interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: string;
  updatedAt?: string;
}

const roleLabels: Record<UserRole, string> = {
  ADMIN: "ผู้ดูแลระบบ",
  AUTHOR: "ผู้สร้างบทความ",
  USER: "ผู้ใช้งาน",
};

const roleClasses: Record<UserRole, string> = {
  ADMIN: "bg-red-50 text-red-700 border-red-200",
  AUTHOR: "bg-blue-50 text-blue-700 border-blue-200",
  USER: "bg-zinc-100 text-zinc-700 border-zinc-200",
};

export default function AdminUsersPage() {
  const { data: session, status: sessionStatus } = useSession();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | UserRole>("ALL");

  const [changingRoleId, setChangingRoleId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const currentUser = session?.user as
    | {
        id?: string;
        name?: string | null;
        email?: string | null;
        role?: string;
      }
    | undefined;

  const isAdmin = currentUser?.role === "ADMIN";

  // ==========================================
  // โหลด Users
  // ==========================================

  const loadUsers = useCallback(async (refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await fetch("/api/users", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "ไม่สามารถโหลดข้อมูลผู้ใช้งานได้"
        );
      }

      const userList = Array.isArray(data)
        ? data
        : Array.isArray(data.users)
          ? data.users
          : [];

      setUsers(userList);
    } catch (error) {
      console.error("Admin users error:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "ไม่สามารถโหลดข้อมูลผู้ใช้งานได้"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // ==========================================
  // ตรวจ Session + โหลดข้อมูล
  // ==========================================

  useEffect(() => {
    if (sessionStatus === "authenticated" && isAdmin) {
      void loadUsers();
    }

    if (sessionStatus === "unauthenticated") {
      setLoading(false);
    }
  }, [sessionStatus, isAdmin, loadUsers]);

  // ==========================================
  // Statistics
  // ==========================================

  const stats = useMemo(() => {
    return {
      total: users.length,
      admin: users.filter((user) => user.role === "ADMIN").length,
      author: users.filter((user) => user.role === "AUTHOR").length,
      user: users.filter((user) => user.role === "USER").length,
    };
  }, [users]);

  // ==========================================
  // Search + Filter
  // ==========================================

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        !keyword ||
        user.name.toLowerCase().includes(keyword) ||
        user.email.toLowerCase().includes(keyword);

      const matchesRole =
        roleFilter === "ALL" || user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  // ==========================================
  // เปลี่ยน Role
  // ==========================================

  const handleChangeRole = async (
    userId: string,
    newRole: UserRole
  ) => {
    if (!isAdmin) {
      toast.error("เฉพาะ Admin เท่านั้นที่สามารถจัดการผู้ใช้ได้");
      return;
    }

    if (userId === currentUser?.id) {
      toast.error("ไม่สามารถเปลี่ยน Role ของบัญชีตัวเองจากหน้านี้ได้");
      return;
    }

    try {
      setChangingRoleId(userId);

      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: newRole,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "ไม่สามารถเปลี่ยน Role ได้"
        );
      }

      setUsers((current) =>
        current.map((user) =>
          user._id === userId
            ? {
                ...user,
                role: newRole,
              }
            : user
        )
      );

      toast.success("เปลี่ยน Role สำเร็จ");
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "ไม่สามารถเปลี่ยน Role ได้"
      );
    } finally {
      setChangingRoleId(null);
    }
  };

  // ==========================================
  // ลบ User
  // ==========================================

  const handleDelete = async (user: User) => {
    if (!isAdmin) {
      toast.error("เฉพาะ Admin เท่านั้นที่สามารถลบผู้ใช้ได้");
      return;
    }

    if (user._id === currentUser?.id) {
      toast.error("ไม่สามารถลบบัญชีตัวเองได้");
      return;
    }

    const confirmed = window.confirm(
      `ต้องการลบผู้ใช้ "${user.name}" ใช่หรือไม่?\n\nการลบผู้ใช้ไม่สามารถย้อนกลับได้`
    );

    if (!confirmed) return;

    try {
      setDeletingId(user._id);

      const response = await fetch(`/api/users/${user._id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "ไม่สามารถลบผู้ใช้งานได้"
        );
      }

      setUsers((current) =>
        current.filter((item) => item._id !== user._id)
      );

      toast.success("ลบผู้ใช้งานสำเร็จ");
    } catch (error) {
      console.error(error);

      toast.error(
        error instanceof Error
          ? error.message
          : "ไม่สามารถลบผู้ใช้งานได้"
      );
    } finally {
      setDeletingId(null);
    }
  };

  // ==========================================
  // Loading
  // ==========================================

  if (sessionStatus === "loading" || loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900" />

          <p className="mt-4 text-sm font-medium text-zinc-500">
            กำลังโหลดข้อมูลผู้ใช้งาน...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // ไม่ใช่ Admin
  // ==========================================

  if (!isAdmin) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="max-w-md rounded-3xl border border-red-100 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-2xl">
            🔒
          </div>

          <h1 className="mt-5 text-xl font-black text-zinc-900">
            ไม่มีสิทธิ์เข้าถึง
          </h1>

          <p className="mt-2 text-sm leading-6 text-zinc-500">
            หน้านี้สำหรับผู้ดูแลระบบเท่านั้น
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // Page
  // ==========================================

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 rounded-3xl border border-zinc-100 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-bold text-blue-600">
            ADMIN PANEL
          </p>

          <h1 className="mt-1 text-2xl font-black tracking-tight text-zinc-900">
            จัดการผู้ใช้งาน
          </h1>

          <p className="mt-1 text-sm text-zinc-500">
            จัดการสมาชิกและสิทธิ์การใช้งานในระบบ
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadUsers(true)}
          disabled={refreshing}
          className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {refreshing ? "กำลังโหลด..." : "↻ รีเฟรช"}
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-3xl border border-zinc-100 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-zinc-500">
            ผู้ใช้งานทั้งหมด
          </p>

          <p className="mt-2 text-3xl font-black text-zinc-900">
            {stats.total}
          </p>
        </div>

        <div className="rounded-3xl border border-red-100 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-zinc-500">
            Admin
          </p>

          <p className="mt-2 text-3xl font-black text-red-600">
            {stats.admin}
          </p>
        </div>

        <div className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-zinc-500">
            Author
          </p>

          <p className="mt-2 text-3xl font-black text-blue-600">
            {stats.author}
          </p>
        </div>

        <div className="rounded-3xl border border-zinc-100 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-zinc-500">
            User
          </p>

          <p className="mt-2 text-3xl font-black text-zinc-700">
            {stats.user}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-3xl border border-zinc-100 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_220px]">
          <div>
            <label className="mb-2 block text-sm font-semibold text-zinc-700">
              ค้นหาผู้ใช้งาน
            </label>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาจากชื่อหรือ Email..."
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none transition focus:border-zinc-400 focus:bg-white focus:ring-2 focus:ring-zinc-900/10"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-zinc-700">
              กรอง Role
            </label>

            <select
              value={roleFilter}
              onChange={(e) =>
                setRoleFilter(
                  e.target.value as "ALL" | UserRole
                )
              }
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none transition focus:border-zinc-400 focus:bg-white focus:ring-2 focus:ring-zinc-900/10"
            >
              <option value="ALL">ทุก Role</option>
              <option value="ADMIN">Admin</option>
              <option value="AUTHOR">Author</option>
              <option value="USER">User</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-3xl border border-zinc-100 bg-white shadow-sm">
        <div className="border-b border-zinc-100 px-6 py-5">
          <h2 className="font-bold text-zinc-900">
            รายชื่อผู้ใช้งาน
          </h2>

          <p className="mt-1 text-xs text-zinc-500">
            แสดง {filteredUsers.length} จาก {users.length} คน
          </p>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="p-16 text-center">
            <div className="text-4xl">👥</div>

            <p className="mt-4 font-semibold text-zinc-700">
              ไม่พบผู้ใช้งาน
            </p>

            <p className="mt-1 text-sm text-zinc-400">
              ลองเปลี่ยนคำค้นหาหรือ Role ที่เลือก
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="border-b border-zinc-100 bg-zinc-50/70 text-xs uppercase tracking-wider text-zinc-400">
                <tr>
                  <th className="px-6 py-4 font-bold">
                    ผู้ใช้งาน
                  </th>

                  <th className="px-6 py-4 font-bold">
                    Email
                  </th>

                  <th className="px-6 py-4 font-bold">
                    Role
                  </th>

                  <th className="px-6 py-4 font-bold">
                    วันที่สมัคร
                  </th>

                  <th className="px-6 py-4 text-right font-bold">
                    จัดการ
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-zinc-100">
                {filteredUsers.map((user) => {
                  const isCurrentUser =
                    user._id === currentUser?.id;

                  const isChanging =
                    changingRoleId === user._id;

                  const isDeleting =
                    deletingId === user._id;

                  return (
                    <tr
                      key={user._id}
                      className="transition-colors hover:bg-zinc-50/50"
                    >
                      {/* User */}
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 font-bold text-zinc-600">
                            {user.name
                              ?.charAt(0)
                              ?.toUpperCase() || "?"}
                          </div>

                          <div>
                            <p className="font-bold text-zinc-900">
                              {user.name || "ไม่มีชื่อ"}
                            </p>

                            {isCurrentUser && (
                              <span className="mt-1 inline-block text-xs font-semibold text-blue-600">
                                บัญชีของคุณ
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-6 py-5">
                        <span className="text-zinc-600">
                          {user.email}
                        </span>
                      </td>

                      {/* Role */}
                      <td className="px-6 py-5">
                        <select
                          value={user.role}
                          disabled={
                            isCurrentUser || isChanging
                          }
                          onChange={(e) =>
                            void handleChangeRole(
                              user._id,
                              e.target.value as UserRole
                            )
                          }
                          className={`rounded-full border px-3 py-1.5 text-xs font-bold outline-none ${roleClasses[user.role]} ${
                            isCurrentUser || isChanging
                              ? "cursor-not-allowed opacity-60"
                              : "cursor-pointer"
                          }`}
                        >
                          <option value="ADMIN">
                            {roleLabels.ADMIN}
                          </option>

                          <option value="AUTHOR">
                            {roleLabels.AUTHOR}
                          </option>

                          <option value="USER">
                            {roleLabels.USER}
                          </option>
                        </select>
                      </td>

                      {/* Created */}
                      <td className="px-6 py-5 text-zinc-500">
                        {user.createdAt
                          ? new Date(
                              user.createdAt
                            ).toLocaleDateString("th-TH", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : "-"}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-5 text-right">
                        <button
                          type="button"
                          disabled={
                            isCurrentUser || isDeleting
                          }
                          onClick={() =>
                            void handleDelete(user)
                          }
                          className="rounded-lg px-3 py-2 text-xs font-semibold text-red-500 transition hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {isDeleting
                            ? "กำลังลบ..."
                            : "ลบ"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}