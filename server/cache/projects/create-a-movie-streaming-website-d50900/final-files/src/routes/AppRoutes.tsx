import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import MovieDetailsPage from '../pages/MovieDetailsPage';
import WatchlistPage from '../pages/WatchlistPage';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/movie/:movieId" element={<MovieDetailsPage />} />
      <Route path="/watchlist" element={<WatchlistPage />} />
    </Routes>
  );
};

export default AppRoutes;
