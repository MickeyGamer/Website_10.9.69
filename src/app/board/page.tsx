import Link from "next/link";
import DOMPurify from "isomorphic-dompurify";

import { connectDB } from "@/lib/mongodb";
import { Thread } from "@/models/Thread";

export const dynamic = "force-dynamic";

interface ThreadAuthor {
  name?: string;
}

interface ThreadData {
  _id: {
    toString(): string;
  };
  title: string;
  content?: string;
  author?: ThreadAuthor | null;
  createdAt: Date | string;
  views?: number;
  repliesCount?: number;
}

export default async function BoardPage() {
  await connectDB();

  const threads = (await Thread.find()
    .populate("author", "name")
    .sort({ createdAt: -1 })
    .lean()) as unknown as ThreadData[];

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 md:py-14">

        {/* Header */}
        <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-600">
              Community Board
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight text-zinc-900 md:text-4xl">
              เว็บบอร์ด
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-500 md:text-base">
              พูดคุย แบ่งปันความรู้ ตั้งคำถาม และแลกเปลี่ยนประสบการณ์กับสมาชิก
              MickeyHub
            </p>
          </div>

          <Link
            href="/board/new"
            className="inline-flex w-fit items-center justify-center rounded-xl bg-zinc-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-zinc-800"
          >
            + ตั้งกระทู้ใหม่
          </Link>
        </div>

        {/* Thread List */}
        {threads.length > 0 ? (
          <section className="space-y-4">
            {threads.map((thread) => {
              const rawContent = thread.content || "";

              const safeContent = DOMPurify.sanitize(rawContent, {
                ALLOWED_TAGS: [],
                ALLOWED_ATTR: [],
              });

              const preview =
                safeContent
                  .replace(/\s+/g, " ")
                  .trim()
                  .slice(0, 180) ||
                "ยังไม่มีรายละเอียดของกระทู้นี้";

              return (
                <article
                  key={thread._id.toString()}
                  className="rounded-3xl border border-zinc-100 bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] md:p-7"
                >
                  <Link
                    href={`/board/${thread._id.toString()}`}
                    className="block"
                  >
                    {/* Thread Title */}
                    <h2 className="text-xl font-black leading-tight text-zinc-900 transition hover:text-blue-600 md:text-2xl">
                      {thread.title}
                    </h2>

                    {/* Content Preview */}
                    <p className="mt-3 line-clamp-3 text-sm leading-7 text-zinc-600 md:text-base">
                      {preview}
                      {safeContent.length > 180 ? "..." : ""}
                    </p>

                    {/* Thread Metadata */}
                    <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-zinc-500">
                      <span className="font-semibold text-zinc-700">
                        {thread.author?.name || "สมาชิกทั่วไป"}
                      </span>

                      <span>•</span>

                      <span>
                        {new Date(thread.createdAt).toLocaleDateString(
                          "th-TH",
                          {
                            dateStyle: "medium",
                          }
                        )}
                      </span>

                      <span>•</span>

                      <span>
                        👁️ {thread.views || 0}
                      </span>

                      <span>•</span>

                      <span>
                        💬 {thread.repliesCount || 0}
                      </span>
                    </div>

                    {/* Read More */}
                    <div className="mt-5">
                      <span className="inline-flex items-center text-sm font-bold text-blue-600">
                        อ่านกระทู้ →
                      </span>
                    </div>
                  </Link>
                </article>
              );
            })}
          </section>
        ) : (
          /* Empty State */
          <section className="rounded-3xl border border-dashed border-zinc-200 bg-white px-6 py-16 text-center">
            <div className="mx-auto max-w-md">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 text-2xl">
                💬
              </div>

              <h2 className="mt-5 text-xl font-black text-zinc-900">
                ยังไม่มีกระทู้
              </h2>

              <p className="mt-2 text-sm leading-6 text-zinc-500">
                เป็นคนแรกที่เริ่มพูดคุยหรือแบ่งปันความรู้กับสมาชิกใน Community
              </p>

              <Link
                href="/board/new"
                className="mt-6 inline-flex items-center justify-center rounded-xl bg-zinc-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-zinc-800"
              >
                ตั้งกระทู้แรก
              </Link>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}