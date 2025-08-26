import type { Metadata } from "next";
import Link from "next/link";
import RouteTransition from "@/components/RouteTransition";
import { Geist_Mono, Open_Sans } from "next/font/google";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Order Builder",
  description: "Create orders quickly and confidently with our step-by-step guided process. Select products, configure pricing, set contract terms, and finalize your order.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${openSans.variable} ${geistMono.variable} font-sans antialiased min-h-screen bg-[#FEFAF3]`}
      >
        <header className="sticky top-0 z-50 border-b bg-background">
          <div className="mx-auto flex h-12 max-w-6xl items-center gap-6 px-4">
            <Link href="/" className="font-medium hover:underline">
              Home
            </Link>
            <Link href="/step-1" className="hover:underline">
              Order Builder
            </Link>
            <Link href="/recent-orders" className="hover:underline">
              Recent Orders
            </Link>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6 min-h-screen">
          <RouteTransition>
            {children}
          </RouteTransition>
        </main>
      </body>
    </html>
  );
}
