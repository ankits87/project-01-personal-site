import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import ThemeProvider from "@/components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ankit Saklani — Developer & Writer",
  description: "Personal site of Ankit Saklani — full-stack developer, blogger, and tech enthusiast.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
        <ThemeProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="text-center text-sm text-gray-400 dark:text-gray-500 py-6 border-t border-gray-200 dark:border-gray-800">
            © {new Date().getFullYear()} Ankit Saklani. Built with Next.js & Tailwind CSS.
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
