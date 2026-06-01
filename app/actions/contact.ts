"use server";

import { createServerClient } from "@/lib/supabase";
import { Resend } from "resend";

export type ContactFormState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "error"; message: string };

const resend = new Resend(process.env.RESEND_API_KEY);

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
    return { status: "error", message: "Something went wrong. Please try again." };
  }

  const { error: emailError } = await resend.emails.send({
    from: "Contact Form <onboarding@resend.dev>",
    to: "ankitsaklani956@gmail.com",
    replyTo: email,
    subject: `New message from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
  });

  if (emailError) {
    console.error("[contact action] Resend error:", emailError);
  }

  return { status: "success" };
}
