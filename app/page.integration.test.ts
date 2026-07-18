import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

describe("home page content (integration, real content/home-page/about.md)", () => {
  it("parses the real about.md with the frontmatter fields the page renders", () => {
    const filePath = path.join(process.cwd(), "content", "home-page", "about.md");
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data: frontmatter, content } = matter(raw);

    expect(frontmatter.name).toBeTruthy();
    expect(frontmatter.title).toBeTruthy();
    expect(content.trim().length).toBeGreaterThan(0);
  });
});
