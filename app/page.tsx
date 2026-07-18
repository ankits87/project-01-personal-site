import fs from "fs";
import path from "path";
import matter from "gray-matter";
import ReactMarkdown from "react-markdown";
import Image from "next/image";
import Link from "next/link";

// To use your real photo: add a file named `profile.jpg` to the /public folder
const PROFILE_IMAGE = "/images/profile.jpg.jpg";

export default function HomePage() {
  const filePath = path.join(process.cwd(), "content", "home-page", "about.md");
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data: frontmatter, content } = matter(raw);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Hero section */}
      <section className="flex flex-col sm:flex-row items-center sm:items-start gap-10 mb-16">
        {/* Profile photo */}
        <div className="shrink-0">
          <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-full overflow-hidden ring-4 ring-brand-subtle shadow-lg">
            <Image
              src={PROFILE_IMAGE}
              alt={`Photo of ${frontmatter.name}`}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>

        {/* Quick intro */}
        <div className="text-center sm:text-left">
          <h1 className="text-4xl sm:text-5xl font-bold text-text-primary mb-2">
            {frontmatter.name}
          </h1>
          <p className="text-lg text-brand-default font-medium mb-3">{frontmatter.title}</p>
          {frontmatter.location && (
            <p className="text-sm text-text-secondary flex items-center justify-center sm:justify-start gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {frontmatter.location}
            </p>
          )}
          <div className="mt-6 flex flex-wrap gap-3 justify-center sm:justify-start">
            <Link
              href="/blog"
              className="px-5 py-2.5 bg-brand-default text-text-on-brand text-sm font-medium rounded-lg hover:bg-brand-hover transition-colors"
            >
              Read My Blog
            </Link>
            <Link
              href="/contact"
              className="px-5 py-2.5 bg-surface-default text-text-secondary text-sm font-medium rounded-lg border border-border-default hover:border-brand-default hover:text-brand-default transition-colors"
            >
              Contact Me
            </Link>
          </div>
        </div>
      </section>

      {/* Markdown content */}
      <section className="prose prose-gray dark:prose-invert prose-headings:text-text-primary prose-a:text-brand-default prose-a:no-underline hover:prose-a:underline max-w-none">
        <ReactMarkdown>{content}</ReactMarkdown>
      </section>
    </div>
  );
}
