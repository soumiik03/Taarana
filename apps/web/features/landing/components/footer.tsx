"use client";

import Link from "next/link";
import Image from "next/image";

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="border-t border-[#E5E5E5]/60 py-12 bg-[#FAFAFA]">
      <div className="w-full px-6 md:px-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left Side: Logo & Copyright (Extreme Left) */}
          <div className="flex-1 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left justify-start">
            <button
              onClick={scrollToTop}
              className="relative h-12 w-36 overflow-visible opacity-90 hover:opacity-100 transition-opacity block cursor-pointer"
              style={{ marginLeft: "-90px", marginRight: "90px" }}
              aria-label="Back to top"
            >
              <Image
                src="/logo.png"
                alt="Taarana Logo"
                fill
                className="object-contain scale-[2.2] origin-left"
              />
            </button>
            <span className="text-xs text-[#737373] font-medium">
              &copy; 2026 Taarana. Built for engineering teams.
            </span>
          </div>

          {/* Right Side: Links (Extreme Right) */}
          <div className="flex-1 flex justify-end items-center space-x-8 text-xs font-bold text-[#737373] tracking-wider">
            <Link href="/" className="hover:text-[#111111] transition-colors uppercase">
              Product
            </Link>
            <Link href="/privacy" className="hover:text-[#111111] transition-colors uppercase">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-[#111111] transition-colors uppercase">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
