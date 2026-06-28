"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

interface RotatingLoaderProps {
  messages: string[];
}

export function RotatingLoader({ messages }: RotatingLoaderProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (messages.length <= 1) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [messages]);

  return (
    <div className="flex flex-col items-center justify-center py-6 text-center space-y-3.5">
      <div className="flex items-center justify-center gap-2">
        <Loader2 className="h-5 w-5 text-indigo-400 animate-spin" />
      </div>
      <p className="text-xs text-[#9B9B9B] font-medium tracking-wide animate-pulse min-h-[16px] transition-all duration-300">
        {messages[index]}
      </p>
    </div>
  );
}
