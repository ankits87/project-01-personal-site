---
title: "TypeScript Generics Without the Confusion"
date: "2026-05-03"
tag: "TypeScript"
excerpt: "Breaking down TypeScript generics with real-world examples that actually make sense."
---

# TypeScript Generics Without the Confusion

Generics are one of the most powerful features in TypeScript — and one of the most misunderstood. Once they click, you'll wonder how you ever wrote TypeScript without them.

## The Core Idea

A generic is a placeholder for a type that gets filled in when you actually use the function or component. Think of it like a variable, but for types.

```ts
function identity<T>(value: T): T {
  return value;
}

identity<string>("hello"); // returns string
identity<number>(42);      // returns number
```

The `<T>` is the type parameter. TypeScript can usually infer it, so you can often skip the explicit annotation.

## A Real Example: `useState`

You use generics every time you call `useState` in React:

```ts
const [count, setCount] = useState<number>(0);
const [user, setUser] = useState<User | null>(null);
```

The `<number>` tells TypeScript what type the state holds.

## Constrained Generics

Sometimes you want the flexibility of generics but need to guarantee the type has certain properties. Use `extends`:

```ts
function getLength<T extends { length: number }>(item: T): number {
  return item.length;
}

getLength("hello");   // ✓ strings have .length
getLength([1, 2, 3]); // ✓ arrays have .length
getLength(42);        // ✗ numbers don't have .length
```

## Generic Interfaces

You can apply generics to interfaces too, which is great for API responses:

```ts
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

type UserResponse = ApiResponse<User>;
type PostsResponse = ApiResponse<Post[]>;
```

## When to Use Them

Reach for generics when you find yourself writing the same function twice with different types. If the logic is identical and only the types differ, that's a generic waiting to be written.

Start simple — one type parameter covers most real-world cases.
