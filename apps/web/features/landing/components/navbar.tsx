"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { Button } from "~/components/ui/button";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 w-full px-6 py-5 md:px-12 flex justify-between items-center transition-all duration-300 border-b ${isScrolled
          ? "bg-[#FAFAFA]/95 backdrop-blur-md border-[#E5E5E5]/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
          : "bg-transparent border-transparent"
        }`}
    >
      {/* Left: Logo (Extreme Left) */}
      <div className="flex-1 flex justify-start">
        <Link href="/" className="relative h-16 w-48 overflow-visible block" style={{ marginLeft: "-110px" }}>
          <Image
            src="/logo.png"
            alt="Taarana Logo"
            fill
            className="object-contain opacity-95 hover:opacity-100 transition-opacity scale-[2.2] origin-left"
            priority
          />
        </Link>
      </div>

      {/* Center: Navigation Links (Absolute Center, Bold) */}
      <nav className="hidden md:flex flex-none justify-center items-center space-x-12">
        <button
          onClick={() => scrollToSection("features")}
          className="text-xs font-bold text-[#737373] hover:text-[#111111] transition-colors cursor-pointer"
        >
          Product
        </button>
        <button
          onClick={() => scrollToSection("difference")}
          className="text-xs font-bold text-[#737373] hover:text-[#111111] transition-colors cursor-pointer"
        >
          For teams
        </button>
        <button
          onClick={() => scrollToSection("pricing")}
          className="text-xs font-bold text-[#737373] hover:text-[#111111] transition-colors cursor-pointer"
        >
          Pricing
        </button>
      </nav>

      {/* Right: Actions (Extreme Right) */}
      <div className="flex-1 flex justify-end items-center space-x-6">
        <Link
          href="/sign-in"
          className="hidden md:inline-block text-xs font-bold text-[#737373] hover:text-[#111111] transition-colors"
        >
          Sign in
        </Link>
        <Link href="/sign-in">
          <button className="group relative isolate overflow-hidden bg-[#111111] text-white text-xs font-semibold px-6 py-2.5 rounded shadow-[0_1px_2px_rgba(0,0,0,0.08)] ring-1 ring-white/10 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] hover:scale-[1.04] hover:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.25)] hover:ring-white/20 active:scale-[0.98] focus:outline-none">
            <div className="shimmer-layer absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent z-10"></div>
            <span className="relative z-20">Start Trial</span>
          </button>
        </Link>
      </div>

      {/* Mobile Menu Button */}
      <div className="md:hidden flex items-center pl-4">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-[#111111] p-2"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-[#FAFAFA] border-b border-[#E5E5E5] px-6 py-8 space-y-6 shadow-xl flex flex-col">
          <button
            onClick={() => scrollToSection("features")}
            className="text-left text-sm font-bold text-[#737373] hover:text-[#111111]"
          >
            Product
          </button>
          <button
            onClick={() => scrollToSection("difference")}
            className="text-left text-sm font-bold text-[#737373] hover:text-[#111111]"
          >
            For teams
          </button>
          <button
            onClick={() => scrollToSection("pricing")}
            className="text-left text-sm font-bold text-[#737373] hover:text-[#111111]"
          >
            Pricing
          </button>
          <div className="pt-6 border-t border-[#E5E5E5] flex flex-col space-y-4">
            <Link href="/sign-in" className="text-sm font-bold text-[#737373] hover:text-[#111111]">
              Sign in
            </Link>
            <Link href="/sign-in" className="w-full">
              <button className="w-full bg-[#111111] text-white text-xs font-semibold py-3.5 rounded shadow-sm">
                Start Trial
              </button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
