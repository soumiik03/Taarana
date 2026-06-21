import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { GlobalProviders } from "~/providers/global";
import { Inter } from "next/font/google";
import { cn } from "~/lib/utils";
import { QueryProvider } from "~/providers/query-provider";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Streamyst",
  description: "Media Forwarding",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("dark", "font-sans", inter.variable)}>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <QueryProvider>
        <GlobalProviders>{children}</GlobalProviders>
        </QueryProvider>
      </body>
    </html>
  );
}
