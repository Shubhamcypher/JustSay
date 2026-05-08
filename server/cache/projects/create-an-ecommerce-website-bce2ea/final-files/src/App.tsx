import React from 'react';
import { CartProvider } from './context/CartContext';
import Header from './components/Header';
import Footer from './components/Footer';
import AppRoutes from './routes/AppRoutes';

const App = () => {
  return (
    <CartProvider>
      <div className="flex flex-col min-h-screen bg-gray-950 text-gray-400">
        <Header />
        <main className="flex-grow">
          <AppRoutes />
        </main>
        <Footer />
      </div>
    </CartProvider>
  );
};

export default App;
