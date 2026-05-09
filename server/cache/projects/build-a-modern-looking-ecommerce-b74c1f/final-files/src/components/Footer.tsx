import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-950 border-t border-gray-800 py-6">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
        <div className="text-gray-400 text-sm">© 2023 VeggieMart. All rights reserved.</div>
        <div className="flex gap-4 mt-4 md:mt-0">
          <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a>
          <a href="#" className="text-gray-400 hover:text-white transition-colors">Contact Us</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
