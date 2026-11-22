import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FE-03: Accessible Component Fundamentals",
  description:
    "Accessible Modal, Tabs, and Disclosure components built strictly following W3C ARIA APG standards in React, TypeScript, and Tailwind CSS.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
