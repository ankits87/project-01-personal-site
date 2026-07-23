import { getAllPosts, getPostBySlug } from "@/lib/posts";
import ReactMarkdown from "react-markdown";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  return { title: post.title };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let post;
  try {
    post = getPostBySlug(slug);
  } catch {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Back link */}
      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-brand-default transition-colors mb-10"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Blog
      </Link>

      {/* Banner */}
      {post.banner && (
        <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-10">
          <Image
            src={post.banner}
            alt={`Banner for ${post.title}`}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 768px) 100vw, 768px"
          />
        </div>
      )}

      {/* Header */}
      <header className="mb-10">
        <span className="inline-block text-xs font-semibold text-brand-default bg-brand-subtle px-2.5 py-1 rounded-full mb-4">
          {post.tag}
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
          {post.title}
        </h1>
        <p className="text-sm text-text-muted">
          {new Date(post.date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </header>

      {/* Content */}
      <article className="prose prose-gray dark:prose-invert prose-headings:text-text-primary prose-a:text-brand-default prose-a:no-underline hover:prose-a:underline prose-code:text-brand-default prose-pre:bg-surface-raised max-w-none">
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </article>
    </div>
  );
}
