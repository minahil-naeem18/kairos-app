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
  title: "Kairos — Discover Scholarships, Jobs & Internships",
  description: "Discover. Apply. Grow. Scholarships, jobs, and internships from around the world — matched to you.",
  openGraph: {
    title: "Kairos — Discover Scholarships, Jobs & Internships",
    description: "Discover. Apply. Grow. Scholarships, jobs, and internships from around the world — matched to you.",
    images: ["/og-image.png"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kairos — Discover Scholarships, Jobs & Internships",
    description: "Discover. Apply. Grow. Scholarships, jobs, and internships from around the world — matched to you.",
    images: ["/og-image.png"],
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
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}