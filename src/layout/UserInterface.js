import { Outlet } from "react-router-dom";
import Footer from "../components/Footer";
import Navbar from "../components/NavBar";

function UserInterface() {
  return (
    <div>
      <Navbar />
      <main className="min-h-screen">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default UserInterface;
