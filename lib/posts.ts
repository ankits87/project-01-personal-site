import fs from "fs";
import path from "path";
import matter from "gray-matter";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  tag: string;
  excerpt: string;
  thumbnail?: string;
  banner?: string;
}

export interface Post extends PostMeta {
  content: string;
}

export function getAllPosts(): PostMeta[] {
  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".md"));

  return files
    .map((filename) => {
      const slug = filename.replace(/\.md$/, "");
      const raw = fs.readFileSync(path.join(BLOG_DIR, filename), "utf-8");
      const { data } = matter(raw);
      return { slug, ...(data as Omit<PostMeta, "slug">) };
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostBySlug(slug: string): Post {
  const filePath = path.join(BLOG_DIR, `${slug}.md`);
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  return { slug, content, ...(data as Omit<PostMeta, "slug">) };
}
