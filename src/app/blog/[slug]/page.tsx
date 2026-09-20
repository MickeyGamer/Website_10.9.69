import { notFound } from "next/navigation";
import { connectDB } from "@/lib/mongodb";
import { Post } from "@/models/Post";
import Link from "next/link";

interface BlogPostProps {
  params: Promise<{ slug: string }>;
}

// ต้องมี export default ตรงนี้เสมอ
export default async function BlogPost({ params }: BlogPostProps) {
  const { slug } = await params;
  await connectDB();
  
  const post = await Post.findOne({ slug, status: "PUBLISHED" })
    .populate("author", "name")
    .populate("category", "name")
    .lean();

  if (!post) {
    notFound();
  }

  const typedPost = post as any;

  return (
    <article className="max-w-3xl mx-auto px-4 py-12 md:py-20">
      
      <header className="mb-12 text-center">
        {typedPost.category && (
          <span className="text-blue-600 font-bold uppercase tracking-widest text-xs mb-4 inline-block bg-blue-50 px-3 py-1 rounded-full">
            {typedPost.category.name}
          </span>
        )}
        <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight tracking-tight">
          {typedPost.title}
        </h1>
        <div className="flex items-center justify-center space-x-4 text-gray-500 text-sm font-medium">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold mr-2 shadow-sm">
              {typedPost.author?.name?.charAt(0) || "A"}
            </div>
            <span>{typedPost.author?.name || "ทีมงาน"}</span>
          </div>
          <span>•</span>
          <time>
            {new Date(typedPost.createdAt).toLocaleDateString("th-TH", {
              year: "numeric", month: "long", day: "numeric",
            })}
          </time>
          <span>•</span>
          <span>อ่าน {typedPost.readingTime || 1} นาที</span>
        </div>
      </header>

      {typedPost.coverImage && (
        <div className="aspect-[21/9] w-full rounded-[2rem] mb-12 overflow-hidden shadow-lg border border-gray-100 relative">
          <img 
            src={typedPost.coverImage} 
            alt={typedPost.title} 
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div 
        className="prose prose-lg prose-blue prose-slate max-w-none mx-auto leading-relaxed prose-headings:font-bold prose-a:text-blue-600 hover:prose-a:text-blue-500 prose-img:rounded-2xl"
        dangerouslySetInnerHTML={{ __html: typedPost.content }}
      />
      
      <div className="mt-16 pt-8 border-t border-gray-100 text-center">
        <Link href="/blog" className="inline-flex items-center justify-center px-6 py-3 border-2 border-gray-200 hover:border-gray-900 text-gray-600 hover:text-gray-900 rounded-full font-medium transition-colors">
          ← กลับไปหน้าบทความ
        </Link>
      </div>

    </article>
  );
}