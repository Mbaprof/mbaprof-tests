import type { Metadata, Viewport } from "next";
import { Libre_Franklin, Montserrat, Roboto } from "next/font/google";
import "./globals.css";

import { RegisterServiceWorker } from "@/components/register-service-worker";

// Fonts follow the MBA Prof brand manual: Roboto for body text, Franklin Gothic
// for headings (Libre Franklin is its closest web font) and Montserrat, the logo
// font, for the tagline and small labels.
const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});
const franklin = Libre_Franklin({
  variable: "--font-franklin",
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
});
const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});
export const metadata: Metadata = {
  metadataBase: new URL("https://tests.mbaprof.in"),
  title: "MBAProf Tests | MBA Entrance Exam Mock Tests",
  description:
    "Practice mock tests for CAT, MAH-CET, MAT, ATMA, and more - timed exams with detailed percentile and section-wise analysis from MBAProf Tests.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MBAProf Tests",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b1d2e",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${roboto.variable} ${franklin.variable} ${montserrat.variable}`}>
      <body className="antialiased bg-white text-brand-ink">
        <noscript>
          <style>{".reveal { opacity: 1 !important; transform: none !important; }"}</style>
        </noscript>
        {children}
        <RegisterServiceWorker />
      </body>
    </html>
  );
}
