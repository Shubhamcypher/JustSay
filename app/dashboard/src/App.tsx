import { Toaster } from 'sonner';
import './index.css'
import AppRoutes from './routes/AppRoutes';

function App() {

  return (
    <>
      <Toaster richColors position="top-right" />
      <AppRoutes />
    </>
  )

}

export default App
