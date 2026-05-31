@AGENTS.md

# Project: Personal Site

## Purpose

A personal portfolio and blog website built as part of the Builders Bible exercises (project-01). It serves as a developer's public presence — showcasing an about section, a markdown-driven blog, and a contact page.

## Tech Stack

| Tool | Version | Role |
|---|---|---|
| Next.js | 16.2.6 | Framework (App Router) |
| React | 19.2.4 | UI library |
| TypeScript | ^5 | Type safety |
| Tailwind CSS | ^4 | Utility-first styling |
| @tailwindcss/typography | ^0.5 | Prose/markdown styling |
| next-themes | ^0.4.6 | Dark/light mode |
| gray-matter | ^4.0.3 | Markdown frontmatter parsing |
| react-markdown | ^10.1.0 | Rendering markdown content |
| ESLint | ^9 | Linting |

## Project Structure

- `app/` — Next.js App Router pages
  - `page.tsx` — Home/about page (reads from `content/home-page/about.md`)
  - `blog/page.tsx` — Blog listing
  - `blog/[slug]/page.tsx` — Individual blog post
  - `contact/page.tsx` — Contact page
  - `layout.tsx` — Root layout with theme provider and nav
- `content/` — Markdown source files for page content and blog posts
- `public/` — Static assets (profile image, SVGs)

## Context

- Content is stored as Markdown files with YAML frontmatter and read at request time via `fs` and `gray-matter`.
- Dark mode is handled by `next-themes`.
- This is exercise project-01 in the Builders Bible series.
