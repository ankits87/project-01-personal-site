"use server";

import { createServerClient } from "@/lib/supabase";

export type ContactFormState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string };

export async function submitContact(
  _prev: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const message = (formData.get("message") as string)?.trim();

  if (!name || !email || !message) {
    return { status: "error", message: "All fields are required." };
  }

  const supabase = createServerClient();
  const { error } = await supabase
    .from("Customer_Contact")
    .insert([{ Customer_Name: name, Email_Address: email, Customer_Message: message }]);

  if (error) {
    console.error("[contact action] Supabase error:", JSON.stringify(error));
    return { status: "error", message: `DEBUG: ${error.code} — ${error.message}` };
  }

  return { status: "success" };
}
