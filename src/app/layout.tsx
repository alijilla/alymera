import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "ALYMERA — AI-Powered Project & Career Workspace",
    template: "%s | ALYMERA",
  },
  description: "An intelligent workspace combining project management, AI coding assistance, and career development tools for modern developers.",
  openGraph: {
    title: "ALYMERA — AI-Powered Project & Career Workspace",
    description: "An intelligent workspace combining project management, AI coding assistance, and career development tools for modern developers.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster />

      </body>
    </html>
  );
}

