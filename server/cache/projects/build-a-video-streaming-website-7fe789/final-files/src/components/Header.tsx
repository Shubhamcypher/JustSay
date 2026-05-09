import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NAV_LINKS } from '../utils/constants';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { pathname } = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
  };

  return (
    <header className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-md text-white border-b border-gray-800">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        <Link to="/" className="text-lg font-semibold tracking-tight">
          VideoStream
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          {(NAV_LINKS ?? []).map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-sm transition-colors ${pathname === link.to ? 'text-white font-medium' : 'text-gray-400 hover:text-white'}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="px-3 py-1.5 rounded-lg bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button type="submit" className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors">
            Search
          </button>
        </form>
      </div>
    </header>
  );
};

export default Header;
