import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NETIZENCITY — The Social Community Virtual World",
  description:
    "Your Community. Your City. Your World. Explore a persistent 2D multiplayer social city for the Netizen City Instagram community.",
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
    <html lang="id" className="h-full antialiased dark">
      <body className="min-h-full bg-slate-950 text-slate-100 flex flex-col">
        {children}
      </body>
    </html>
  );
}
