import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SideBar from "@/components/side_bar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "B+ Indexer Desktop Application",
  description: "Environment for B+ Indexer to monitor and manage ADIM services.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="w-screen flex h-screen">
          <div className="w-1/6">
            <SideBar />
          </div>
          <div className="w-5/6">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
