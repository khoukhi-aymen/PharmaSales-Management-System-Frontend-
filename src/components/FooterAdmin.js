import React, { Component } from "react";
import { Facebook, Instagram, Linkedin } from "lucide-react";

class FooterAdmin extends Component {
  render() {
    return (
      <footer className="footerAdmin">
        <div className="footerAdmin-content">
          <div className="social-icons">
            <a href="https://www.facebook.com/profile.php?id=61575732694091&locale=ar_AR" target="_blank" rel="noopener noreferrer"><Facebook /></a>
            <a href="https://www.instagram.com/clinique_elsafwa/" target="_blank" rel="noopener noreferrer"><Instagram /></a>
            <a href="https://www.linkedin.com/company/clinique-el-safwa/posts/?feedView=all" target="_blank" rel="noopener noreferrer"><Linkedin /></a>
          </div>
          <p>© 2025 Mon Entreprise. Tous droits réservés.</p>
        </div>
      </footer>
    );
  }
}

export default FooterAdmin;
