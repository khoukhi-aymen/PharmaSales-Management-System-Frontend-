import { Route, Routes } from 'react-router-dom';
import './App.css';
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import '@fortawesome/fontawesome-free/css/all.min.css';
import UserInterface from './layout/UserInterface';
import AdminInterface from './layout/adminInterface';
import Login from './pages/Login';
import Ventes from './pages/adminPages/VentesClient';
import Achats from './pages/adminPages/AchatsFournisseur';
import FacturesProformats from './pages/adminPages/Proformats';
import Stock from './pages/adminPages/Stock';


function App() {
  return (
    <div>
      <Routes>
        {/* Interface utilisateur publique */}
        <Route path="/" element={<UserInterface />}>
          <Route path="login" element={<Login />} /> {/*  login fonctionne ici */}
        </Route>

        {/* Interface admin */}
        <Route path="/admin" element={<AdminInterface />}>
          <Route path="Stock" element={<Stock />} />
          <Route path="Ventes" element={<Ventes />} />
          <Route path="Achats" element={<Achats />} />
          <Route path="FacturesProformats" element={<FacturesProformats />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
