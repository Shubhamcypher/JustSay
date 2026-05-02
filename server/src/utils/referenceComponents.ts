// src/utils/referenceComponents.ts

export const REFERENCE_NAVBAR = `
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  const links = [
    { to: "/", label: "Home" },
    { to: "/dashboard", label: "Dashboard" },
    { to: "/pricing", label: "Pricing" },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        <span className="text-white font-semibold text-lg tracking-tight">AppName</span>
        <div className="hidden md:flex items-center gap-6">
          {links.map(l => (
            <Link
              key={l.to}
              to={l.to}
              className={\`text-sm transition-colors \${pathname === l.to ? "text-white font-medium" : "text-gray-400 hover:text-white"}\`}
            >{l.label}</Link>
          ))}
          <button className="ml-4 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 transition-colors">
            Get started
          </button>
        </div>
        <button className="md:hidden text-gray-400 hover:text-white" onClick={() => setOpen(o => !o)}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={open ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </div>
      {open && (
        <div className="md:hidden bg-gray-950 border-t border-gray-800 px-4 py-3 flex flex-col gap-3">
          {links.map(l => (
            <Link key={l.to} to={l.to} className="text-sm text-gray-300 hover:text-white" onClick={() => setOpen(false)}>{l.label}</Link>
          ))}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
`.trim();

export const REFERENCE_HERO = `
const Hero = ({ title, subtitle, ctaLabel, onCta }: {
  title: string;
  subtitle: string;
  ctaLabel: string;
  onCta: () => void;
}) => (
  <section className="relative bg-gray-950 text-white overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/30 via-gray-950 to-gray-950 pointer-events-none" />
    <div className="relative max-w-6xl mx-auto px-4 py-24 flex flex-col items-center text-center gap-6">
      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-medium uppercase tracking-wider">
        New release
      </span>
      <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight max-w-3xl">
        {title}
      </h1>
      <p className="text-gray-400 text-lg max-w-xl leading-relaxed">{subtitle}</p>
      <div className="flex flex-col sm:flex-row gap-3 mt-2">
        <button
          onClick={onCta}
          className="px-6 py-3 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-900/40"
        >
          {ctaLabel}
        </button>
        <button className="px-6 py-3 rounded-xl border border-gray-700 text-gray-300 hover:border-gray-500 hover:text-white transition-colors">
          See demo
        </button>
      </div>
    </div>
  </section>
);

export default Hero;
`.trim();

export const REFERENCE_CARD_GRID = `
interface Item {
  id: string;
  title: string;
  description: string;
  badge?: string;
  icon?: string;
}

const CardGrid = ({ items, onSelect }: { items: Item[]; onSelect: (id: string) => void }) => (
  <section className="py-16 bg-gray-900">
    <div className="max-w-6xl mx-auto px-4">
      <h2 className="text-2xl font-semibold text-white mb-2">Features</h2>
      <p className="text-gray-400 mb-10">Everything you need to move fast.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map(item => (
          <div
            key={item.id}
            onClick={() => onSelect(item.id)}
            className="group relative bg-gray-800/60 border border-gray-700/50 rounded-2xl p-6 cursor-pointer hover:border-indigo-500/50 hover:bg-gray-800 transition-all duration-200"
          >
            {item.badge && (
              <span className="absolute top-4 right-4 text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {item.badge}
              </span>
            )}
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 flex items-center justify-center mb-4 group-hover:bg-indigo-600/30 transition-colors">
              <span className="text-indigo-400 text-lg">{item.icon ?? "+"}</span>
            </div>
            <h3 className="text-white font-medium mb-1">{item.title}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default CardGrid;
`.trim();