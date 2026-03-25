import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AdminLayout } from "@/src/components/admin/layout/AdminLayout";

/**
 * ADMIN DASHBOARD — Root Layout
 *
 * Font strategy:
 *   DM Sans         → --font-dm-sans  → picked up by --font-sans in globals.css
 *   JetBrains Mono  → --font-jetbrains-mono → picked up by --font-mono
 *
 * AdminLayout is mounted here (not in a route group) so the sidebar + header
 * shell is shared by every admin route, including future routes added outside
 * the (dashboard) group.
 */

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | PC Store Admin",
    default: "PC Store Admin Dashboard",
  },
  description: "Back-office administration dashboard — manage orders, products, inventory, and customers.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${jetbrainsMono.variable}`}>
      <body className="antialiased">
        <AdminLayout>{children}</AdminLayout>
      </body>
    </html>
  );
}
