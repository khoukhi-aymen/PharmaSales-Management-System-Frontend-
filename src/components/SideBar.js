import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Users, UserCheck, UserX, LogOut, Trash2, Package, ClipboardList, Database, UserCog } from "lucide-react";
import axios from "../Config/axiosConfig";

class AdminSidebar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      alertMessage: "",
      alertType: "",
      openClients: false,
      openArticles: false,
      openBackup: false,
      openUsers: false,
      role: "",
      name: ""
    };
  }


  componentDidMount() {
    axios.get("http://localhost:8000/me", { withCredentials: true })
      .then(res => {
        this.setState({
          role: res.data.user.role,
          name: res.data.user.name
        });
      })
  }

  handleLogout = () => {
    axios.post("http://localhost:8000/logout", {}, { withCredentials: true })
      .then(() => {
        this.setState({
          alertMessage: "Déconnexion réussie",
          alertType: "success",
        });

        setTimeout(() => {
          window.location.href = "/login";
        }, 1000);
      })
      .catch(() => {
        this.setState({
          alertMessage: "Échec de la déconnexion",
          alertType: "error",
        });
      });
  };

  closeAlert = () => {
    this.setState({ alertMessage: "", alertType: "" });
  };

  toggleClients = () => {
    this.setState(prev => ({
      openClients: !prev.openClients
    }));
  };

  toggleArticles = () => {
    this.setState(prev => ({ openArticles: !prev.openArticles }));
  };

  toggleUsers = () => {
    this.setState(prev => ({
      openUsers: !prev.openUsers
    }));
  };


  toggleBackup = () => {
    this.setState(prev => ({
      openBackup: !prev.openBackup
    }));
  };

  render() {
    return (
      <>
        {/* -------- ALERT -------- */}
        {this.state.alertMessage && (
          <div className={`alert-msg ${this.state.alertType}`}>
            <div className="alert-msg-content">
              <span>{this.state.alertMessage}</span>
              <button
                className="alert-ok-btn"
                onClick={this.closeAlert}
                style={{ marginLeft: "10px" }}
              >
                OK
              </button>
            </div>
          </div>
        )}

        <aside className="admin-sidebar flex flex-col justify-between min-h-screen">

          {/* -------- HAUT -------- */}
          <div>
            <div className="sidebar-logo">
              <img src="/images/admin.png" alt="Logo" />
              <h2>{this.state.name || "Admin"}</h2>
            </div>

            <nav className="sidebar-menu">

              {/* Clients / Fournisseurs */}
              {(this.state.role === "admin" || this.state.role === "fusion_clients") && (
                <>
                  <div className="sidebar-link submenu-title" onClick={this.toggleClients}>
                    <Users size={20} />
                    <span>Tiers</span>
                  </div>

                  {this.state.openClients && (
                    <div className="submenu">
                      <Link to="/biztrack/get/Tier/Actif" className="sidebar-sublink">
                        <UserCheck size={16} /> Actifs
                      </Link>

                      <Link to="/biztrack/get/Tier/inactifs" className="sidebar-sublink">
                        <UserX size={16} /> Non actifs
                      </Link>

                      <Link to="/biztrack/get/Tier/deleted" className="sidebar-sublink">
                        <Trash2 size={16} /> Supprimés
                      </Link>
                    </div>
                  )}
                </>
              )}


              {/* Articles */}

              {(this.state.role === "admin" || this.state.role === "fusion_articles") && (
                <>
                  <div className="sidebar-link submenu-title" onClick={this.toggleArticles}>
                    <Package size={20} />
                    <span>Articles</span>
                  </div>

                  {this.state.openArticles && (
                    <div className="submenu">
                      <Link to="/biztrack/get/articles/actifs" className="sidebar-sublink">
                        <UserCheck size={16} /> Actifs
                      </Link>

                      <Link to="/biztrack/get/articles/inactifs" className="sidebar-sublink">
                        <UserX size={16} /> Non actifs
                      </Link>
                    </div>
                  )}
                </>
              )}

              {/* Logs */}

              {this.state.role === "admin" && (
                <Link to="/admin/logs" className="sidebar-link">
                  <ClipboardList size={20} />
                  <span>Logs</span>
                </Link>
              )}



              {/* BACKUP */}
              {this.state.role === "admin" && (
                <Link to="/admin/backups" className="sidebar-link">
                  <Database size={20} />
                  <span>Sauvegardes</span>
                </Link>
              )}


              {/* USERS MANAGEMENT */}
              {this.state.role === "admin" && (
                <>
                  <div className="sidebar-link submenu-title" onClick={this.toggleUsers}>
                    <UserCog size={20} />
                    <span>Users</span>
                  </div>

                  {this.state.openUsers && (
                    <div className="submenu">
                      <Link to="/admin/users/actifs" className="sidebar-sublink">
                        <UserCheck size={16} /> Actifs
                      </Link>

                      <Link to="/admin/users/inactifs" className="sidebar-sublink">
                        <UserX size={16} /> Inactifs
                      </Link>
                    </div>
                  )}
                </>
              )}


            </nav>
          </div>

          {/* -------- BAS -------- */}
          <div className="sidebar-footer p-4">
            <button onClick={this.handleLogout} className="logout-btn">
              <LogOut size={18} /> Logout
            </button>
          </div>

        </aside>
      </>
    );
  }
}

export default AdminSidebar;