import React from 'react';
import AppRoutes from './routes/AppRoutes';
import { ThemeProvider } from './context/ThemeContext';

const App = () => {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-950 text-white">
        <AppRoutes />
      </div>
    </ThemeProvider>
  );
};

export default App;
