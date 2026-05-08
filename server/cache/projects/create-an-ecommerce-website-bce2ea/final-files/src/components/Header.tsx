import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  const links = [
    { to: '/', label: 'Home' },
    { to: '/products', label: 'Products' },
    { to: '/cart', label: 'Cart' },
    { to: '/profile', label: 'Profile' }
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-gray-800 bg-gray-950/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        <span className="text-white font-semibold text-lg tracking-tight">E-Shop</span>
        <div className="hidden md:flex items-center gap-6">
          {(links ?? []).map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-sm transition-colors ${pathname === link.to ? 'text-white font-medium' : 'text-gray-400 hover:text-white'}`}
            >
              {link.label}
            </Link>
          ))}
          <button className="ml-4 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 transition-colors">
            Sign In
          </button>
        </div>
        <button className="md:hidden text-gray-400 hover:text-white" onClick={() => setOpen(o => !o)}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={open ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
          </svg>
        </button>
      </div>
      {open && (
        <div className="md:hidden bg-gray-950 border-t border-gray-800 px-4 py-3 flex flex-col gap-3">
          {(links ?? []).map(link => (
            <Link key={link.to} to={link.to} className="text-sm text-gray-300 hover:text-white" onClick={() => setOpen(false)}>{link.label}</Link>
          ))}
        </div>
      )}
    </header>
  );
};

export default Header;
