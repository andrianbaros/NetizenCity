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
  title: "NETIZENCITY — Kota Virtual Komunitas Netizen",
  description:
    "Kota Virtual 3D Sosial Interaktif untuk Komunitas Instagram Netizen City.",
  icons: {
    icon: "/favicon.ico",
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
