import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";

interface OAuthProvider {
  name: string;
  icon: string;
  onClick: () => void;
}

interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;

  showOAuth?: boolean;
  providers?: OAuthProvider[];

  footer?: ReactNode;
}

export default function AuthCard({
  title,
  subtitle,
  children,
  showOAuth = false,
  providers = [],
  footer,
}: AuthCardProps) {
  return (
    <Card className="w-[420px] relative rounded-2xl overflow-hidden backdrop-blur-3xl flex flex-col bg-gradient-to-br from-white/1 via-white/2 to-white/3 border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.6)]">

      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-transparent to-black/30 pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

      <div className="relative z-10 flex flex-col h-full">

        {/* Header */}
        <div className="text-center px-4 pt-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-white/50 mt-2">{subtitle}</p>
          )}
        </div>

        {/* Form */}
        <div className="px-4 py-4 flex flex-col gap-4">
          {children}
        </div>

        {/* OAuth */}
        {showOAuth && (
          <div className="px-4 pb-4 flex flex-col gap-4">

            {/* Divider */}
            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-white/50">or continue with</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Providers */}
            <div className="flex flex-col gap-4">
              {providers.map((p, i) => (
                <button
                  key={i}
                  onClick={p.onClick}
                  className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg py-2 text-sm text-white transition"
                >
                  <img src={p.icon} className="w-4 h-4" />
                 <p className="min-w-40 text-left"> Continue with {p.name} </p>
                </button>
              ))}
            </div>

          </div>
        )}

        {/* Footer */}
        {footer && (
          <div className="px-4 pb-4 text-center text-sm text-white/60">
            {footer}
          </div>
        )}

      </div>
    </Card>
  );
}