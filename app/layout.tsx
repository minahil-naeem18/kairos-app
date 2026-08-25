import type { Metadata } from "next";
import { Geist, Geist_Mono, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import Navbar from "./navbar";
import { ThemeProvider } from "./theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://the-kairos.vercel.app"),
  title: "Kairos — Discover Scholarships, Jobs & Internships",
  description: "Discover. Apply. Grow. Scholarships, jobs, and internships from around the world — matched to you.",
  icons: {
    icon: [
      { url: "/logo/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/logo/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/logo/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/logo/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/logo/apple-touch-icon.png",
  },
  openGraph: {
    title: "Kairos — Discover Scholarships, Jobs & Internships",
    description: "Discover. Apply. Grow. Scholarships, jobs, and internships from around the world — matched to you.",
    images: [
      {
        url: "/logo/og-image.png",
        width: 1200,
        height: 800,
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kairos — Discover Scholarships, Jobs & Internships",
    description: "Discover. Apply. Grow. Scholarships, jobs, and internships from around the world — matched to you.",
    images: [
      {
        url: "/logo/og-image.png",
        width: 1200,
        height: 800,
      },
    ],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
               <ThemeProvider>
          <Providers>
            <Navbar />
            <main className="flex-1">{children}</main>
            <footer
              className="border-t px-6 py-4 text-right text-xs"
              style={{ borderColor: "var(--border)", color: "var(--muted)" }}
            >
              Made by Minahil Naeem
            </footer>
          </Providers>
        </ThemeProvider>
        {/* Credit badge */}
        <div
          style={{
            position: "fixed",
            bottom: "14px",
            left: "14px",
            zIndex: 50,
            fontSize: "11px",
            fontWeight: 500,
            padding: "6px 12px",
            borderRadius: "999px",
            background: "var(--surface)",
            color: "var(--muted)",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-sm)",
            pointerEvents: "none",
            opacity: 0.85,
          }}
        >
          Made by Minahil Naeem
        </div>
      </body>
    </html>
  );
}