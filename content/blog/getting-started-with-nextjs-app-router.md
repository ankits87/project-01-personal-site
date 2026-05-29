---
title: "Getting Started with Next.js App Router"
date: "2026-05-10"
tag: "Next.js"
excerpt: "A deep dive into the App Router architecture introduced in Next.js 13 and how it changes the way we think about routing."
---

# Getting Started with Next.js App Router

The App Router is the new default way to build applications in Next.js. It moves away from the classic `pages/` directory and introduces a more expressive, file-system-based routing model inside the `app/` folder.

## What Changed

With the Pages Router, every file in `pages/` became a route. The App Router extends this with a few key ideas:

- **Layouts** — wrap multiple routes with shared UI without re-rendering
- **Server Components** — components that render entirely on the server by default
- **Nested routing** — folders define route segments, and each can have its own `layout.tsx`, `loading.tsx`, and `error.tsx`

## File Conventions

```
app/
├── layout.tsx       ← root layout (always rendered)
├── page.tsx         ← renders at /
├── blog/
│   ├── page.tsx     ← renders at /blog
│   └── [slug]/
│       └── page.tsx ← renders at /blog/:slug
```

## Server vs Client Components

By default, every component in the `app/` directory is a **Server Component**. This means it runs only on the server — no JavaScript is shipped to the browser for it.

When you need interactivity (state, event handlers, browser APIs), add `"use client"` at the top of the file:

```tsx
"use client";

import { useState } from "react";

export default function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

## Why It Matters

The App Router makes it easier to build fast, data-heavy applications. You can fetch data directly inside Server Components — no `useEffect`, no client-side loading states for the initial render. The result is leaner bundles and faster page loads.

It takes some adjustment if you're used to the Pages Router, but it's worth the switch.
