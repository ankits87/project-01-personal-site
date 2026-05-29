import Link from "next/link";
import { getAllPosts } from "@/lib/posts";

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Blog</h1>
      <p className="text-gray-500 dark:text-gray-400 text-lg mb-12">
        Thoughts, tutorials, and stories from my journey as a developer.
      </p>

      <div className="grid gap-8 sm:grid-cols-2">
        {posts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="block group">
            <article className="h-full bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 group-hover:border-indigo-300 dark:group-hover:border-indigo-700 group-hover:shadow-md transition-all">
              <span className="inline-block text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 rounded-full mb-3">
                {post.tag}
              </span>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-2">
                {post.title}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-4">
                {post.excerpt}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {new Date(post.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </article>
          </Link>
        ))}
      </div>
    </div>
  );
}
