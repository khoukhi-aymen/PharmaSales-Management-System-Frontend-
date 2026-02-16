import React, { Component } from "react";
import { Link, Navigate } from "react-router-dom";
import { ShoppingCart, Package, FileText, LogOut } from "lucide-react";
import axios from "axios";

class AdminSidebar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      redirectToLogin: false,
      alertMessage: "",
      alertType: "", // "success" ou "error"
      openCommandes: false, // nouveau
    };
  }

  handleLogout = () => {
    axios.post("http://localhost:8000/logout", {}, { withCredentials: true })
      .then(res => {
        this.setState({
          alertMessage: "",
          alertType: "",
        });

        // Après 1 seconde → redirige
        setTimeout(() => {
          window.location.href = "/login";
        }, 1000);
      })
      .catch(err => {
        this.setState({
          alertMessage: "Erreur lors de la déconnexion",
          alertType: "error",
        });
      });
  };

  // -------- FERMETURE DU MESSAGE ----------
  closeAlert = () => {
    this.setState({ alertMessage: "", alertType: "" });
  };

  toggleCommandes = () => {
    this.setState(prevState => ({
      openCommandes: !prevState.openCommandes
    }));
  };



  render() {
    // Si déconnexion → redirection vers /login
    if (this.state.redirectToLogin) {
      return <Navigate to="/login" replace />;
    }

    return (

      <>
        {/* ----------- MESSAGE ALERT ----------- */}
        {this.state.alertMessage && (
          <div className={`top-alert ${this.state.alertType}`}>
            <div className="top-alert-content">
              <span>{this.state.alertMessage}</span>
              <button className="top-alert-btn" onClick={this.closeAlert}>
                OK
              </button>
            </div>
          </div>
        )}
        <aside className="admin-sidebar flex flex-col justify-between min-h-screen">
          {/* Partie haute : logo + menu */}
          <div>
            <div className="sidebar-logo">
              <img src="/images/admin.png" alt="Logo" />
              <h2>Portail Admin</h2>
            </div>

            <nav className="sidebar-menu">
              <Link to="/admin/Stock" className="sidebar-link">
                <Package size={20} /> <span>Stock</span>
              </Link>

              <div className="sidebar-link submenu-title" onClick={this.toggleCommandes}>
                <ShoppingCart size={20} />
                <span>Commandes</span>
              </div>

              {this.state.openCommandes && (
                <div className="submenu">
                  <Link to="/admin/Achats" className="sidebar-sublink">
                    ▸ Achats
                  </Link>

                  <Link to="/admin/Ventes" className="sidebar-sublink">
                    ▸ Ventes
                  </Link>
                </div>
              )}

              <Link to="/admin/FacturesProformats" className="sidebar-link">
                <FileText size={20} /> <span>Proformas</span>
              </Link>
            </nav>
          </div>

          {/* Partie basse : bouton de déconnexion */}
          <div className="sidebar-footer p-4">
            <button
              onClick={this.handleLogout}
              className="logout-btn"
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        </aside>
      </>
    );
  }
}

export default AdminSidebar;
