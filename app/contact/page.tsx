"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { submitContact } from "@/app/actions/contact";

export default function ContactPage() {
  const [state, action, pending] = useActionState(submitContact, { status: "idle" });
  const [showModal, setShowModal] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      setShowModal(true);
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">Contact Me</h1>
      <p className="text-gray-500 dark:text-gray-400 text-lg mb-10">
        Have a question, a project idea, or just want to say hi? Drop me a message.
      </p>

      <form ref={formRef} action={action} className="space-y-6">
        {state.status === "error" && (
          <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 px-4 py-3 text-sm text-red-700 dark:text-red-300">
            {state.message}
          </div>
        )}

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Your Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            placeholder="John Doe"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="john@example.com"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            rows={5}
            required
            placeholder="What's on your mind?"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full sm:w-auto px-8 py-3 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {pending ? "Sending…" : "Send Message"}
        </button>
      </form>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-sm w-full px-8 py-10 text-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900 mx-auto mb-5">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Thank you!</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
              Thanks for sharing your details. We will get in touch with you.
            </p>
            <button
              onClick={() => setShowModal(false)}
              className="mt-7 px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
