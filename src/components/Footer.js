import { Component } from "react";
import { withTranslation } from "react-i18next";

class Footer extends Component {
  render() {

    return (
      <div>
        {/* Footer Section */}
        <footer className="footer">
          <div className="social-icons">
            <a
              href="https://www.facebook.com/profile.php?id=61575732694091&locale=ar_AR"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fab fa-facebook-f"></i>
            </a>

            <a
              href="https://www.instagram.com/clinique_elsafwa/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fab fa-instagram"></i>
            </a>

            <a
              href="https://www.linkedin.com/company/clinique-el-safwa/posts/?feedView=all"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="fab fa-linkedin-in"></i>
            </a>
          </div>

          <p className="footer-text">© {new Date().getFullYear()} Clinique El Safwa. Tous droits réservés.</p>

        </footer>
      </div>
    );
  }
}

export default withTranslation()(Footer);
