import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@fontsource/tajawal/400.css";
import "@fontsource/tajawal/500.css";
import "@fontsource/tajawal/700.css";
import "@fontsource/tajawal/800.css";
import "@fontsource/tajawal/900.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "DevHub | مركز إدارة قسم التطوير",
  description: "لوحة داخلية لإدارة قسم التطوير والمهام اليومية.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">{children}</body>
    </html>
  );
}
