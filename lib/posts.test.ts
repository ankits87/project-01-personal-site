import { describe, it, expect, vi, beforeEach } from "vitest";
import fs from "fs";
import { getAllPosts, getPostBySlug } from "./posts";

vi.mock("fs");

const POST_A = `---
title: Post A
date: "2024-01-10"
tag: Tech
excerpt: Excerpt A
---
Content A body.
`;

const POST_B = `---
title: Post B
date: "2024-03-05"
tag: Tips
excerpt: Excerpt B
thumbnail: /images/b-thumb.jpg
banner: /images/b-banner.jpg
---
Content B body.
`;

function mockFilesystem(files: Record<string, string>) {
  vi.mocked(fs.readdirSync).mockReturnValue(Object.keys(files) as never);
  vi.mocked(fs.readFileSync).mockImplementation((filePath) => {
    const name = Object.keys(files).find((f) => filePath.toString().endsWith(f));
    if (!name) {
      const err = new Error(`ENOENT: no such file, open '${filePath}'`) as NodeJS.ErrnoException;
      err.code = "ENOENT";
      throw err;
    }
    return files[name];
  });
}

describe("getAllPosts", () => {
  beforeEach(() => {
    mockFilesystem({ "a.md": POST_A, "b.md": POST_B, "notes.txt": "ignore me" });
  });

  it("returns one entry per .md file, ignoring non-.md files", () => {
    expect(getAllPosts()).toHaveLength(2);
  });

  it("derives slug from filename by stripping .md", () => {
    const slugs = getAllPosts().map((p) => p.slug).sort();
    expect(slugs).toEqual(["a", "b"]);
  });

  it("sorts posts by date descending (newest first)", () => {
    const posts = getAllPosts();
    expect(posts[0].slug).toBe("b");
    expect(posts[1].slug).toBe("a");
  });

  it("maps frontmatter fields via gray-matter", () => {
    const b = getAllPosts().find((p) => p.slug === "b")!;
    expect(b.title).toBe("Post B");
    expect(b.date).toBe("2024-03-05");
    expect(b.tag).toBe("Tips");
    expect(b.excerpt).toBe("Excerpt B");
  });

  it("handles posts missing optional thumbnail/banner fields", () => {
    const a = getAllPosts().find((p) => p.slug === "a")!;
    expect(a.thumbnail).toBeUndefined();
    expect(a.banner).toBeUndefined();
  });
});

describe("getPostBySlug", () => {
  beforeEach(() => {
    mockFilesystem({ "a.md": POST_A });
  });

  it("returns content with frontmatter stripped", () => {
    expect(getPostBySlug("a").content.trim()).toBe("Content A body.");
  });

  it("throws when no file matches the slug", () => {
    expect(() => getPostBySlug("missing")).toThrow();
  });

  it("returned slug matches the input", () => {
    expect(getPostBySlug("a").slug).toBe("a");
  });
});
