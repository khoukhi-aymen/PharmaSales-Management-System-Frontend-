import React, { Component } from "react";
import axios from "../Config/axiosConfig";

const ROLES = ["admin", "fusion_clients", "fusion_articles"];

class CreateUserModal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            name: "",
            email: "",
            password: "",
            role: "",
            alertMessage: "",
            alertType: "",
            loading: false,
            isBlocking: false
        };
    }

    handleChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        });
    };

    handleSubmit = (e) => {
        e.preventDefault();

        this.setState({ loading: true });

        const data = {
            name: this.state.name,
            email: this.state.email,
            password: this.state.password,
            role: this.state.role
        };

        axios.post(
            "http://localhost:8000/admin/users/create",
            data,
            { withCredentials: true }
        )
            .then((res) => {
                this.setState({
                    alertMessage: res.data.message || "Utilisateur créé avec succès",
                    alertType: "success",
                    loading: false,
                    isBlocking: true
                });
            })
            .catch((err) => {
                this.setState({
                    alertMessage: err.response?.data?.message || "Erreur création",
                    alertType: "error",
                    loading: false,
                    isBlocking: true
                });
            });
    };

    render() {
        return (
            <div className="update-modal-overlay">
                <div className="update-modal">

                    <h3>Créer un utilisateur</h3>

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
                                        alertType: "",
                                        isBlocking: false
                                    });

                                    // refresh parent
                                    this.props.onSuccess();

                                    // fermer modal
                                    this.props.onClose();
                                }}
                            >
                                OK
                            </button>
                        </div>
                    )}

                    <form onSubmit={this.handleSubmit} autoComplete="off">

                        <div className="update-section">
                            <div className="update-grid">

                                <input
                                    name="name"
                                    value={this.state.name}
                                    onChange={this.handleChange}
                                    placeholder="Nom"
                                />

                                <input
                                    name="email"
                                    type="email"
                                    value={this.state.email}
                                    onChange={this.handleChange}
                                    autoComplete="new-email"
                                    placeholder="Email"
                                    required
                                />

                                <input
                                    name="password"
                                    type="password"
                                    value={this.state.password}
                                    onChange={this.handleChange}
                                    autoComplete="new-password"
                                    placeholder="Mot de passe"
                                    required
                                />

                                <select
                                    name="role"
                                    value={this.state.role}
                                    onChange={this.handleChange}
                                    required
                                >
                                    <option value="">-- Choisir un rôle --</option>

                                    {ROLES.map(r => (
                                        <option key={r} value={r}>
                                            {r}
                                        </option>
                                    ))}
                                </select>

                            </div>
                        </div>

                        <div className="update-buttons">
                            <button
                                type="submit"
                                className="update-save"
                                disabled={this.state.loading}
                            >
                                Créer
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

                    {this.state.loading && <div className="blocking-overlay"></div>}
                    {this.state.isBlocking && <div className="blocking-overlay"></div>}

                    {this.state.loading && (
                        <div className="fusion-alert">
                            <div className="fusion-alert-content">
                                <div className="fusion-loading-state">
                                    <div className="spinner large"></div>
                                    <p>création en cours...</p>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        );
    }
}

export default CreateUserModal;