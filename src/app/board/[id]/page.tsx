import { notFound } from "next/navigation";
import Link from "next/link";
import DOMPurify from "isomorphic-dompurify";

import { connectDB } from "@/lib/mongodb";
import { Thread } from "@/models/Thread";
import { Comment } from "@/models/Comment";

import CommentBox from "./CommentBox";

export const dynamic = "force-dynamic";

interface ThreadPageProps {
  params: Promise<{
    id: string;
  }>;
}

interface AuthorData {
  name?: string;
}

interface ThreadData {
  _id: {
    toString(): string;
  };
  title: string;
  content?: string;
  author?: AuthorData | null;
  createdAt: Date | string;
  views?: number;
}

interface CommentData {
  _id: {
    toString(): string;
  };
  content?: string;
  author?: AuthorData | null;
  createdAt: Date | string;
}

export default async function ThreadPage({
  params,
}: ThreadPageProps) {
  const { id } = await params;

  await connectDB();

  // ================================
  // ดึงข้อมูลกระทู้ + เพิ่ม Views
  // ================================
  const thread = (await Thread.findByIdAndUpdate(
    id,
    {
      $inc: {
        views: 1,
      },
    },
    {
      new: true,
    }
  )
    .populate("author", "name")
    .lean()) as unknown as ThreadData | null;

  // ไม่พบกระทู้
  if (!thread) {
    notFound();
  }

  // ================================
  // ดึงความคิดเห็น
  // ================================
  const comments = (await Comment.find({
    thread: id,
  })
    .populate("author", "name")
    .sort({
      createdAt: 1,
    })
    .lean()) as unknown as CommentData[];

  // ================================
  // ป้องกัน XSS ของกระทู้
  // ================================
  const safeThreadContent = DOMPurify.sanitize(
    thread.content || ""
  );

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-12">

        {/* Back Button */}
        <Link
          href="/board"
          className="mb-8 inline-flex items-center text-sm font-medium text-zinc-500 transition hover:text-zinc-900"
        >
          ← กลับไปหน้าเว็บบอร์ด
        </Link>

        {/* Thread */}
        <article className="mb-10 rounded-3xl border border-zinc-100 bg-white p-8 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04)] md:p-10">

          {/* Title */}
          <h1 className="mb-6 text-2xl font-black leading-tight text-zinc-900 md:text-4xl">
            {thread.title}
          </h1>

          {/* Author / Date / Views */}
          <div className="mb-8 flex items-center gap-3 border-b border-zinc-100 pb-8">

            {/* Avatar */}
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 font-bold text-white shadow-sm">
              {thread.author?.name?.charAt(0) || "U"}
            </div>

            <div>
              <p className="text-sm font-bold text-zinc-900">
                {thread.author?.name || "สมาชิกทั่วไป"}
              </p>

              <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                <span>
                  {new Date(thread.createdAt).toLocaleString(
                    "th-TH",
                    {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }
                  )}
                </span>

                <span>•</span>

                <span>
                  👁️ {thread.views || 0} ครั้ง
                </span>
              </div>
            </div>
          </div>

          {/* Thread Content */}
          <div
            className="
              prose
              prose-zinc
              prose-lg
              max-w-none
              prose-headings:font-bold
              prose-p:leading-8
              prose-img:rounded-2xl
              prose-a:text-blue-600
            "
            dangerouslySetInnerHTML={{
              __html: safeThreadContent,
            }}
          />
        </article>

        {/* Comments */}
        <section className="mb-12 space-y-6">
          <h2 className="px-2 text-lg font-black text-zinc-900">
            ความคิดเห็น ({comments.length})
          </h2>

          {comments.length > 0 ? (
            comments.map((comment, index) => (
              <article
                key={comment._id.toString()}
                className="flex gap-4 rounded-3xl border border-zinc-100 bg-white p-6 shadow-sm"
              >
                {/* Avatar */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-zinc-200 bg-zinc-100 font-bold text-zinc-600">
                  {comment.author?.name?.charAt(0) || "?"}
                </div>

                <div className="min-w-0 flex-1">

                  {/* Comment Header */}
                  <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                    <span className="text-sm font-bold text-zinc-900">
                      {comment.author?.name || "สมาชิก"}
                    </span>

                    <span className="text-xs font-medium text-zinc-400">
                      ความคิดเห็นที่ {index + 1}
                      {" • "}
                      {new Date(
                        comment.createdAt
                      ).toLocaleString("th-TH", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </span>
                  </div>

                  {/* Comment Content */}
                  <div
                    className="prose prose-sm max-w-none text-zinc-700"
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(
                        comment.content || ""
                      ),
                    }}
                  />
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-3xl border border-dashed border-zinc-200 bg-zinc-50/50 py-12 text-center">
              <p className="font-medium text-zinc-500">
                ยังไม่มีความคิดเห็น เป็นคนแรกที่คอมเมนต์สิ!
              </p>
            </div>
          )}
        </section>

        {/* Comment Box */}
        <CommentBox threadId={id} />

      </div>
    </main>
  );
}