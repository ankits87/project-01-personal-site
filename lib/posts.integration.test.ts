import { describe, it, expect } from "vitest";
import { getAllPosts, getPostBySlug } from "./posts";

describe("posts (integration, real content/blog directory)", () => {
  it("returns at least one post from the real content directory", () => {
    expect(getAllPosts().length).toBeGreaterThan(0);
  });

  it("every post has all required fields non-empty", () => {
    for (const post of getAllPosts()) {
      expect(post.slug).toBeTruthy();
      expect(post.title).toBeTruthy();
      expect(post.date).toBeTruthy();
      expect(post.tag).toBeTruthy();
      expect(post.excerpt).toBeTruthy();
    }
  });

  it("every post's date is valid and parseable", () => {
    for (const post of getAllPosts()) {
      expect(Number.isNaN(new Date(post.date).getTime())).toBe(false);
    }
  });

  it("returns posts sorted by date descending", () => {
    const dates = getAllPosts().map((post) => new Date(post.date).getTime());
    const sorted = [...dates].sort((a, b) => b - a);
    expect(dates).toEqual(sorted);
  });

  it("has no duplicate slugs", () => {
    const slugs = getAllPosts().map((post) => post.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("resolves every listed slug via getPostBySlug with matching slug and content", () => {
    for (const { slug } of getAllPosts()) {
      const post = getPostBySlug(slug);
      expect(post.slug).toBe(slug);
      expect(post.content.trim().length).toBeGreaterThan(0);
    }
  });

  it("strips YAML frontmatter from post content", () => {
    for (const { slug } of getAllPosts()) {
      const post = getPostBySlug(slug);
      expect(post.content.trim().startsWith("---")).toBe(false);
    }
  });
});
