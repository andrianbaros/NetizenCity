import type { Metadata } from "next";
import { Fredoka, Quicksand } from "next/font/google";
import "./globals.css";

const fredoka = Fredoka({
  subsets: ["latin"],
  variable: "--font-fredoka",
  weight: ["400", "500", "600", "700"],
});

const quicksand = Quicksand({
  subsets: ["latin"],
  variable: "--font-quicksand",
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "NETIZENCITY — How Netizen Build Our City",
  description:
    "Kota Virtual 3D Sosial Interaktif untuk Komunitas Netizen City (@netizencity.id).",
  metadataBase: new URL("https://netizencity.web.id"),
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/brand/icon-96.png", sizes: "96x96", type: "image/png" },
      { url: "/brand/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/brand/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/brand/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "NETIZENCITY — How Netizen Build Our City",
    description: "Kota Virtual 3D Sosial Interaktif untuk Komunitas Netizen City.",
    url: "https://netizencity.web.id",
    siteName: "Netizen City",
    images: [
      {
        url: "/brand/og-image.png",
        width: 1200,
        height: 630,
        alt: "Netizen City — How Netizen Build Our City",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NETIZENCITY — How Netizen Build Our City",
    description: "Kota Virtual 3D Sosial Interaktif untuk Komunitas Netizen City.",
    images: ["/brand/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`h-full antialiased ${fredoka.variable} ${quicksand.variable}`}>
      <body className="h-full min-h-[100dvh] overflow-hidden font-sans bg-[#FBF7F0] text-[#3B3340] flex flex-col antialiased selection:bg-[#F4A98C]/30 selection:text-[#3B3340]">
        {children}
      </body>
    </html>
  );
}
