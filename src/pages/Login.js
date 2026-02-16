import React, { Component } from "react";
import axios from "axios";

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password: "",
      alertMessage: "",
      alertType: "", // success | error
    };
  }


  componentDidMount() {
    // Vérifier si l'utilisateur est déjà connecté
    axios.get("http://localhost:8000/login", { withCredentials: true })
      .then(res => {
        if (res.data.loggedIn) {
          // Rediriger directement vers dashboard si déjà connecté
          window.location.href = res.data.redirectUrl;
        }
      })
      .catch(err => console.error(err));
  }


  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const { email, password } = this.state;
    axios.post(
      "http://localhost:8000/login",
      { email, password },
      { withCredentials: true }
    )
      .then((res) => {
        const { message, redirectUrl } = res.data;

        this.setState({
          alertMessage: message,
          alertType: "success",
        });

        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 1000);
      })
      .catch((err) => {
        this.setState({
          alertMessage: err.response?.data?.message || "Échec de la connexion.",
          alertType: "error",
        });
      });
  };

  closeAlert = () => {
    this.setState({ alertMessage: "", alertType: "" });
  };

  render() {
    const { email, password, alertMessage, alertType } = this.state;

    return (
      <section className="login-page-section">
        <div className="login-page-box">
          <h2>Connexion Administrateur</h2>
          <form onSubmit={this.handleSubmit} className="login-page-form">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={email}
              onChange={this.handleChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={password}
              onChange={this.handleChange}
              required
            />
            <button type="submit">Se connecter</button>
          </form>

          {alertMessage && (
            <div className={`custom-alert advanced-alert ${alertType}`}>
              <div className="alert-content">
                <p>{alertMessage}</p>
              </div>
              <button className="alert-btn" onClick={this.closeAlert}>
                OK
              </button>
            </div>
          )}
        </div>
      </section>
    );
  }
}

export default Login;
