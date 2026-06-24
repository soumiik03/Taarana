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
  title: "Taarana AI - Smart PR Reviews & Code Analysis",
  description: "Automate code reviews, sync GitHub repositories, and get advanced analytics for your workspaces with Taarana AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", inter.variable)} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <QueryProvider>
        <GlobalProviders>{children}</GlobalProviders>
        </QueryProvider>
      </body>
    </html>
  );
}
