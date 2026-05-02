import React, { Component } from "react";
import { Facebook, Instagram, Linkedin } from "lucide-react";

class FooterAdmin extends Component {
  render() {
    return (
      <footer className="footerAdmin">
        <div className="footerAdmin-content">
          <div className="social-icons">
            <a href="https://www.facebook.com/epecia/" target="_blank" rel="noopener noreferrer"><Facebook /></a>
            <a href="https://www.instagram.com/epecia.store/" target="_blank" rel="noopener noreferrer"><Instagram /></a>
            <a href="https://www.linkedin.com/company/epecia" target="_blank" rel="noopener noreferrer"><Linkedin /></a>
          </div>
          <p>© 2026 Epecia. Tous droits réservés.</p>
        </div>
      </footer>
    );
  }
}

export default FooterAdmin;
