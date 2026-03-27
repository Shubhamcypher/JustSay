import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";

interface AuthCardProps {
  children: ReactNode;
  className?: string;
}

export default function AuthCard({ children, className }: AuthCardProps) {
  return (
    <Card
      className={`
        w-[420px] relative rounded-2xl overflow-hidden
        backdrop-blur-3xl flex flex-col justify-between
        bg-gradient-to-br from-white/1 via-white/2 to-white/3 
        border border-white/10 
        shadow-[0_10px_40px_rgba(0,0,0,0.6)]
        ${className}
      `}
    >
      {/* 🔥 Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-transparent to-black/30 pointer-events-none" />

      {/* 🔥 Top reflection */}
      <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

      {/* 🔥 Glow */}
      <div className="absolute inset-0 rounded-2xl pointer-events-none">
        <div className="absolute inset-0 rounded-2xl border border-white/10" />
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-2xl opacity-30 animate-[pulse_8s_ease-in-out_infinite]" />
      </div>

      {/* 🔥 Content */}
      <div className="relative z-10 flex flex-col h-full">
        {children}
      </div>
    </Card>
  );
}