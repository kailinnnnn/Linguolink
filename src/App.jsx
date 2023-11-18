import { Outlet } from "react-router-dom";
import Sidebar from "./component/Sidebar";

function App() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <Outlet />
    </div>
  );
}

export default App;
