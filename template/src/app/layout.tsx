import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "{{PROJECT_NAME}}",
  description: "Next.js + Supabase with end-to-end security",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
