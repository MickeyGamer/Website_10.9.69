import Link from "next/link";
import type { Metadata } from "next";
import { connectDB } from "@/lib/mongodb";
import Blog from "@/models/ฺBlog";

export const metadata: Metadata = {
  title: "บทความ",
  description: "รวมบทความและข่าวสารล่าสุด",
};

export const dynamic = "force-dynamic";

export default async function BlogsPage() {
  let serializedBlogs = [];

  try {
    await connectDB();
    const blogs = await Blog.find().sort({ createdAt: -1 }).lean();

    serializedBlogs = blogs.map((blog) => ({
      _id: blog._id.toString(),
      title: String(blog.title ?? ""),
      slug: String(blog.slug ?? ""),
      content: String(blog.content ?? ""),
      createdAt: blog.createdAt
        ? new Date(blog.createdAt).toLocaleDateString("th-TH", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        : "",
    }));
  } catch (error) {
    console.error("Failed to fetch blogs:", error);
    return <p>ไม่สามารถโหลดบทความได้</p>;
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-10">
      {/* header เหมือนเดิม */}

      {serializedBlogs.length === 0 ? (
        <div className="...">ยังไม่มีบทความ</div>
      ) : (
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {serializedBlogs.map((blog) => (
            <Link key={blog._id} href={`/blog/${blog.slug}`} className="block">
              <article className="...">
                {/* เนื้อหา */}
              </article>
            </Link>
          ))}
        </section>
      )}
    </main>
  );
}