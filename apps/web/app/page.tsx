import { Metadata } from "next";
import { Navbar } from "~/features/landing/components/navbar";
import { Hero } from "~/features/landing/components/hero";
import { Features } from "~/features/landing/components/features";
import { Difference } from "~/features/landing/components/difference";
import { Pricing } from "~/features/landing/components/pricing";
import { CTA } from "~/features/landing/components/cta";
import { Footer } from "~/features/landing/components/footer";

export const metadata: Metadata = {
  title: "Taarana - Autonomous Product Delivery Platform",
  description:
    "Taarana is an AI-powered product delivery platform that automatically maps feature requests to PRDs, generates tasks, and performs requirements-based code reviews.",
};

export default async function Home() {
  return (
    <div className="w-full min-h-screen text-[#111111] antialiased relative bg-[#FAFAFA]">

      {/* Oravia Style Injection */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .technical-grid {
          background-size: 40px 40px;
          background-image:
            linear-gradient(to right, rgba(0, 0, 0, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 0, 0, 0.03) 1px, transparent 1px);
          mask-image: linear-gradient(to bottom, black 70%, transparent 100%);
        }
        .premium-card {
          background: #FFFFFF;
          border: 1px solid #EAEAEA;
          box-shadow: 0 2px 4px rgba(0,0,0,0.01), 0 8px 16px -4px rgba(0,0,0,0.02);
          transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        .premium-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.02), 0 12px 24px -6px rgba(0,0,0,0.04);
          border-color: #D4D4D4;
        }
        .pricing-transition {
          transition:
            transform 300ms cubic-bezier(0.22, 1, 0.36, 1),
            box-shadow 300ms cubic-bezier(0.22, 1, 0.36, 1),
            border-color 500ms cubic-bezier(0.22, 1, 0.36, 1),
            opacity 500ms cubic-bezier(0.22, 1, 0.36, 1),
            background-color 500ms cubic-bezier(0.22, 1, 0.36, 1);
          will-change: transform, opacity, box-shadow;
        }
        @keyframes shimmer-anim {
          100% { transform: translateX(100%); }
        }
        .shimmer-layer {
          transform: translateX(-100%);
        }
        .group:hover .shimmer-layer {
          animation: shimmer-anim 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}} />

      {/* Grid Pattern overlay */}
      <div className="fixed inset-0 z-0 technical-grid pointer-events-none"></div>

      {/* Page Content */}
      <div className="relative z-10 flex flex-col w-full">
        {/* Navigation */}
        <Navbar />

        {/* Hero Section */}
        <Hero />

        {/* Bento Capabilities Grid */}
        <Features />

        {/* Side-by-side comparison matrix */}
        <Difference />

        {/* Pricing Selection cards */}
        <Pricing />

        {/* Bottom CTA Block */}
        <CTA />

        {/* Footer Area */}
        <Footer />
      </div>

    </div>
  );
}
