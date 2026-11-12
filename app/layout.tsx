import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DeskBot – AI-Powered IT Helpdesk Ticket Agent (PS4)",
  description:
    "Enterprise IT Helpdesk Agent built with Gemini 3.8 Flash, Next.js, and Supabase for SRM Agentic AI Hackathon.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F7F8FA] text-[#1E293B] antialiased">
        {children}
      </body>
    </html>
  );
}
