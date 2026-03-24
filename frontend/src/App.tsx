import { Toaster } from 'sonner';
import './index.css'
import AppRoutes from './routes/AppRoutes';

function App() {

  return (
    <>
      <Toaster richColors position="top-center" />
      <AppRoutes />
    </>
  )

}

export default App
