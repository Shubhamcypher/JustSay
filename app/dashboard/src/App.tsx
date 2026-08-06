import { Toaster } from 'sonner';
import './index.css'
import { API_URL, BUILDER_URL } from "@/config/env";
import AppRoutes from './routes/AppRoutes';

function App() {


  console.log(API_URL);
  console.log(BUILDER_URL);

  return (
    <>
      <Toaster richColors position="top-center" />
      <AppRoutes />
    </>
  )

}

export default App
