import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockInsert, mockSend } = vi.hoisted(() => ({
  mockInsert: vi.fn(),
  mockSend: vi.fn(),
}));

vi.mock("@/lib/supabase", () => ({
  createServerClient: () => ({
    from: () => ({ insert: mockInsert }),
  }),
}));

vi.mock("resend", () => ({
  Resend: class {
    emails = { send: mockSend };
  },
}));

import { submitContact } from "./contact";

const VALID_FIELDS = { name: "Jane Doe", email: "jane@example.com", message: "Hello there" };

function formData(fields: Partial<typeof VALID_FIELDS>) {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined) fd.set(key, value);
  }
  return fd;
}

function omit(fields: typeof VALID_FIELDS, key: keyof typeof VALID_FIELDS) {
  const copy = { ...fields };
  delete copy[key];
  return copy;
}

describe("submitContact", () => {
  beforeEach(() => {
    mockInsert.mockReset().mockResolvedValue({ error: null });
    mockSend.mockReset().mockResolvedValue({ error: null });
  });

  it("returns an error when name is missing", async () => {
    const result = await submitContact({ status: "idle" }, formData(omit(VALID_FIELDS, "name")));
    expect(result).toEqual({ status: "error", message: "All fields are required." });
  });

  it("returns an error when email is missing", async () => {
    const result = await submitContact({ status: "idle" }, formData(omit(VALID_FIELDS, "email")));
    expect(result.status).toBe("error");
  });

  it("returns an error when message is missing", async () => {
    const result = await submitContact({ status: "idle" }, formData(omit(VALID_FIELDS, "message")));
    expect(result.status).toBe("error");
  });

  it("treats a whitespace-only field as missing", async () => {
    const result = await submitContact({ status: "idle" }, formData({ ...VALID_FIELDS, name: "   " }));
    expect(result).toEqual({ status: "error", message: "All fields are required." });
  });

  it("returns success and inserts the row when Supabase and Resend both succeed", async () => {
    const result = await submitContact({ status: "idle" }, formData(VALID_FIELDS));
    expect(result).toEqual({ status: "success" });
    expect(mockInsert).toHaveBeenCalledWith([
      { Customer_Name: "Jane Doe", Email_Address: "jane@example.com", Customer_Message: "Hello there" },
    ]);
  });

  it("returns an error when the Supabase insert fails", async () => {
    mockInsert.mockResolvedValue({ error: { message: "db down" } });
    const result = await submitContact({ status: "idle" }, formData(VALID_FIELDS));
    expect(result).toEqual({ status: "error", message: "Something went wrong. Please try again." });
  });

  it("still returns success when the Resend email fails", async () => {
    mockSend.mockResolvedValue({ error: { message: "resend down" } });
    const result = await submitContact({ status: "idle" }, formData(VALID_FIELDS));
    expect(result).toEqual({ status: "success" });
  });
});
