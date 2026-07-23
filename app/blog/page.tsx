import Link from "next/link";
import Image from "next/image";
import { getAllPosts } from "@/lib/posts";

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold text-text-primary mb-4">Blog</h1>
      <p className="text-text-secondary text-lg mb-12">
        Thoughts, tutorials, and stories from my journey as a developer.
      </p>

      <div className="grid gap-8 sm:grid-cols-2">
        {posts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="block group">
            <article className="h-full bg-surface-default rounded-xl border border-border-default group-hover:border-brand-default group-hover:shadow-md transition-all overflow-hidden">
              {(post.thumbnail ?? post.banner) && (
                <div className="relative w-full aspect-video">
                  <Image
                    src={(post.thumbnail ?? post.banner)!}
                    alt={`Thumbnail for ${post.title}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 50vw"
                  />
                </div>
              )}
              <div className="p-6">
                <span className="inline-block text-xs font-semibold text-brand-default bg-brand-subtle px-2.5 py-1 rounded-full mb-3">
                  {post.tag}
                </span>
                <h2 className="text-lg font-semibold text-text-primary group-hover:text-brand-default transition-colors mb-2">
                  {post.title}
                </h2>
                <p className="text-text-secondary text-sm leading-relaxed mb-4">
                  {post.excerpt}
                </p>
                <p className="text-xs text-text-muted">
                  {new Date(post.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </div>
  );
}
