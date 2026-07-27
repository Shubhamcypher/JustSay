import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ProjectProvider } from './context/ProjectContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ProjectProvider>
      <App />
    </ProjectProvider>
  </StrictMode>,
)

const hideBootScreen = () => {
  const boot = document.getElementById("boot-screen");

  if (!boot) return;

  boot.classList.add("hide");

  setTimeout(() => {
    boot.remove();
  }, 350);
};

window.addEventListener("load", hideBootScreen);