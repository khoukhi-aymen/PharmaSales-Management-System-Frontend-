import React, { Component } from "react";
import axios from "../Config/axiosConfig";
import { FiEye, FiEyeOff } from "react-icons/fi";

class ResetPasswordModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      password: "",
      confirmPassword: "",
      showPassword: false,
      showConfirmPassword: false,
      alertMessage: "",
      alertType: "",
      loading: false
    };
  }

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  togglePassword = () => {
    this.setState((prev) => ({
      showPassword: !prev.showPassword
    }));
  };

  toggleConfirmPassword = () => {
    this.setState((prev) => ({
      showConfirmPassword: !prev.showConfirmPassword
    }));
  };

  handleSubmit = (e) => {
    e.preventDefault();

    const { password, confirmPassword } = this.state;

    if (password !== confirmPassword) {
      return this.setState({
        alertMessage: "Les mots de passe ne correspondent pas",
        alertType: "error"
      });
    }

    this.setState({ loading: true });

    axios.post(
      `http://localhost:8000/admin/users/reset-password/${this.props.user._id}`,
      { password },
      { withCredentials: true }
    )
      .then((res) => {
        this.setState({
          alertMessage: res.data.message,
          alertType: "success",
          loading: false
        });

        this.props.onSuccess();
      })
      .catch(() => {
        this.setState({
          alertMessage: "Erreur reset password",
          alertType: "error",
          loading: false
        });
      });
  };

  render() {
    return (
      <div className="update-modal-overlay">
        <div className="update-modal">

          <h3>Réinitialiser mot de passe</h3>

          {/* ALERT */}
          {this.state.alertMessage && (
            <div className={`advanced-alert ${this.state.alertType}`}>
              <span>{this.state.alertMessage}</span>
              <button
                className="alert-btn"
                style={{ marginLeft: "10px" }}
                onClick={() => {
                  this.setState({
                    alertMessage: "",
                    alertType: ""
                  });

                  this.props.onClose();
                }}
              >
                OK
              </button>
            </div>
          )}

          <form onSubmit={this.handleSubmit}>

            {/* PASSWORD */}
            <div style={{ position: "relative", marginBottom: "15px" }}>
              <input
                type={this.state.showPassword ? "text" : "password"}
                name="password"
                placeholder="Nouveau mot de passe"
                onChange={this.handleChange}
                required
                style={{ width: "100%", paddingRight: "40px" }}
              />

              <span
                onClick={this.togglePassword}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                  color: "#666"
                }}
              >
                {this.state.showPassword ? <FiEyeOff /> : <FiEye />}
              </span>
            </div>

            {/* CONFIRM PASSWORD */}
            <div style={{ position: "relative", marginBottom: "15px" }}>
              <input
                type={this.state.showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirmer mot de passe"
                onChange={this.handleChange}
                required
                style={{ width: "100%", paddingRight: "40px" }}
              />

              <span
                onClick={this.toggleConfirmPassword}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                  color: "#666"
                }}
              >
                {this.state.showConfirmPassword ? <FiEyeOff /> : <FiEye />}
              </span>
            </div>

            {/* BUTTONS */}
            <div className="update-buttons">

              <button className="update-save" disabled={this.state.loading}>
                Valider
              </button>

              <button
                type="button"
                className="update-close"
                onClick={this.props.onClose}
              >
                Fermer
              </button>

            </div>

          </form>

        </div>
      </div>
    );
  }
}

export default ResetPasswordModal;