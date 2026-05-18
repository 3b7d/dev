import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700", "800", "900"],
  variable: "--font-tajawal",
});

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
    <html lang="ar" dir="rtl" className="dark">
      <body className={`${tajawal.variable} min-h-screen bg-background font-sans text-foreground antialiased`}>
        {children}
      </body>
    </html>
  );
}
