import React from 'react';
import { Link } from 'react-router-dom';
import { NAV_LINKS } from '../utils/constants';
import useCart from '../hooks/useCart';

const Header = () => {
  const { cartItems } = useCart();
  const cartItemCount = cartItems?.length ?? 0;

  return (
    <header className="sticky top-0 z-50 bg-gray-950/80 border-b border-gray-800 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        <Link to="/" className="text-white font-semibold text-lg tracking-tight">VeggieMart</Link>
        <nav className="flex items-center gap-6">
          {(NAV_LINKS ?? []).map(link => (
            <Link key={link.to} to={link.to} className="text-sm text-gray-400 hover:text-white transition-colors">
              {link.label}
            </Link>
          ))}
          <Link to="/cart" className="relative text-gray-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.5 6h13l-1.5-6M7 13H3m0 0l-1.5-6h15.5" />
            </svg>
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
