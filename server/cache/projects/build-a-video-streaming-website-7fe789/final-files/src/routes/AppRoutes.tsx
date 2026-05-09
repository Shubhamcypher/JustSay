import { Routes, Route } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import VideoPage from '../pages/VideoPage';
import ChannelPage from '../pages/ChannelPage';

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/video/:id" element={<VideoPage />} />
    <Route path="/channel/:id" element={<ChannelPage />} />
  </Routes>
);

export default AppRoutes;
