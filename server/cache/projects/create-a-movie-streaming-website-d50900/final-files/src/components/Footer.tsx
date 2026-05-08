const Footer = () => {
  return (
    <footer className="bg-gray-950 text-gray-400 py-8">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
        <div className="flex gap-4 mb-4 md:mb-0">
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-white transition-colors">Contact Us</a>
        </div>
        <div className="flex gap-4">
          <a href="#" className="hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M22.54 6.42a8.59 8.59 0 0 1-2.46.67 4.3 4.3 0 0 0 1.89-2.37 8.6 8.6 0 0 1-2.73 1.04 4.28 4.28 0 0 0-7.29 3.9 12.14 12.14 0 0 1-8.82-4.47 4.28 4.28 0 0 0 1.32 5.71 4.27 4.27 0 0 1-1.94-.54v.05a4.28 4.28 0 0 0 3.43 4.2 4.3 4.3 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.97 8.59 8.59 0 0 1-5.32 1.84A8.6 8.6 0 0 1 2 19.54a12.14 12.14 0 0 0 6.57 1.92c7.88 0 12.2-6.53 12.2-12.2v-.56a8.72 8.72 0 0 0 2.14-2.22z" />
            </svg>
          </a>
          <a href="#" className="hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.04c-5.5 0-9.96 4.46-9.96 9.96 0 4.41 2.86 8.15 6.84 9.49.5.09.68-.22.68-.48 0-.24-.01-.87-.01-1.71-2.78.61-3.37-1.34-3.37-1.34-.45-1.14-1.1-1.45-1.1-1.45-.9-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.56-1.11-4.56-4.95 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.56 9.56 0 0 1 2.5-.34c.85.01 1.71.11 2.5.34 1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.85-2.34 4.7-4.57 4.95.36.31.68.92.68 1.85 0 1.34-.01 2.42-.01 2.75 0 .27.18.58.69.48A9.96 9.96 0 0 0 22 12c0-5.5-4.46-9.96-9.96-9.96z" />
            </svg>
          </a>
          <a href="#" className="hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M22.23 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.21 0 22.23 0zM7.19 20.45H3.56V9.02h3.63v11.43zm-1.82-13a2.1 2.1 0 1 1 0-4.2 2.1 2.1 0 0 1 0 4.2zm15.45 13h-3.63v-5.6c0-1.34-.03-3.06-1.87-3.06-1.87 0-2.16 1.46-2.16 2.96v5.7h-3.63V9.02h3.49v1.56h.05c.49-.93 1.68-1.9 3.46-1.9 3.7 0 4.38 2.44 4.38 5.6v6.17z" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
