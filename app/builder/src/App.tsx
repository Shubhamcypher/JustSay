import { API_URL, DASHBOARD_URL } from "./config/env";
import AppRoutes from "./routes/AppRoutes";

console.log(API_URL);
console.log(DASHBOARD_URL);

export default function App() {
  return <AppRoutes />;
}