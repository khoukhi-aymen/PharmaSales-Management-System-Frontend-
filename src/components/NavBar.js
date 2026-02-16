import React, { Component } from "react";
import { Link } from "react-router-dom";


class Navbar extends Component {


   constructor(props) {
        super(props);
        this.state = {
            showAppointment: false, //contrôle affichage modale
        };
    }


  render() {
    return (
      <div>
        <nav className="navbar navbar-expand-lg fixed-top custom-navbar">
          <div className="container">
            {/* Logo */}
            <Link className="navbar-brand fw-bold brand-logo d-flex align-items-center" to="/">
              <img src="/images/logo.png" alt="Elsafwa Clinic Logo" className="logo-img" />
              <span style={{ marginLeft: "8px" }}>Nom de l’entreprise</span>
            </Link>

            {/* Burger menu (mobile) */}
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarNav"
              aria-controls="navbarNav"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="custom-toggler-icon">
                <span></span>
                <span></span>
                <span></span>
              </span>
            </button>
          </div>
        </nav>
      </div>
    );
  }
}

export default Navbar;
