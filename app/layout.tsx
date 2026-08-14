import "./globals.css";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Digital Investment Management Platform",
  description: "Modern Investment Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}