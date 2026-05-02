import { Route, Routes } from 'react-router-dom';
import './App.css';
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import '@fortawesome/fontawesome-free/css/all.min.css';
import UserInterface from './layout/UserInterface';
import AdminInterface from './layout/adminInterface';
import Login from './pages/Login';
import TierActif from './pages/adminPages/TierActif';
import TierNonActif from './pages/adminPages/TierNonActif';
import TierDeleted from './pages/adminPages/TierDeleted';
import ArticlesActif from './pages/adminPages/ArticlesActif';
import ArticlesNonActif from './pages/adminPages/ArticleNonActif';
import Logs from './pages/adminPages/Journal';
import Backups from './pages/adminPages/Backups';
import UsersActifs from './pages/adminPages/UsersActif';
import UsersInactifs from './pages/adminPages/UsersInactif';


function App() {
  return (
    <div>
      <Routes>
        {/* Interface utilisateur publique */}
        <Route path="/" element={<UserInterface />}>
          <Route path="login" element={<Login />} /> {/*  login fonctionne ici */}
        </Route>

        {/* Interface admin */}
        <Route path="/" element={<AdminInterface />}>
          <Route path="biztrack/get/Tier/Actif" element={<TierActif />} />
          <Route path="biztrack/get/Tier/inactifs" element={<TierNonActif />} />
          <Route path="biztrack/get/Tier/deleted" element={<TierDeleted />} />
          <Route path="biztrack/get/articles/actifs" element={<ArticlesActif />} />
          <Route path="biztrack/get/articles/inactifs" element={<ArticlesNonActif />} />
          <Route path="admin/logs" element={<Logs />} />
          <Route path="admin/backups" element={<Backups />} />
          <Route path="admin/users/actifs" element={<UsersActifs />} />
          <Route path="admin/users/inactifs" element={<UsersInactifs />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
