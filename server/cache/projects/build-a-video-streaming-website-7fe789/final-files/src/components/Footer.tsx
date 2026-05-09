const Footer = () => (
  <footer className="bg-gray-950 text-gray-400 py-8">
    <div className="max-w-6xl mx-auto px-4">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h2 className="text-white font-semibold text-lg mb-2">VideoStream</h2>
          <p className="text-sm">Your go-to platform for streaming videos.</p>
        </div>
        <div className="flex flex-col gap-2">
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-white transition-colors">Contact Us</a>
        </div>
        <div className="flex gap-4">
          <a href="#" className="hover:text-white transition-colors">Facebook</a>
          <a href="#" className="hover:text-white transition-colors">Twitter</a>
          <a href="#" className="hover:text-white transition-colors">Instagram</a>
        </div>
      </div>
      <div className="text-center text-sm mt-4">
        &copy; {new Date().getFullYear()} VideoStream. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
