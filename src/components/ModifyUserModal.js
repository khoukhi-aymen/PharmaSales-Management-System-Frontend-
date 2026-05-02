import React, { Component } from "react";
import axios from "../Config/axiosConfig";

const ROLES = [
    "admin",
    "fusion_clients",
    "fusion_articles"
];

class ModifyUserModal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            user: props.user || {},
            alertMessage: "",
            alertType: "",
            isBlocking: false
        };
    }

    componentDidUpdate(prevProps) {
        if (prevProps.user?._id !== this.props.user?._id) {
            const cleanUser = { ...this.props.user };

            delete cleanUser.password;

            this.setState({
                user: cleanUser
            });
        }
    }

    handleChange = (e) => {
        const { name, value } = e.target;

        this.setState((prev) => ({
            user: {
                ...prev.user,
                [name]: value
            }
        }));
    };

    handleSubmit = (e) => {
        e.preventDefault();

        const payload = {
            name: this.state.user.name,
            email: this.state.user.email,
            role: this.state.user.role
        };

        axios.post(
            `http://localhost:8000/admin/users/update/${this.props.user._id}`,
            payload,
            { withCredentials: true }
        )
            .then((res) => {
                this.setState({
                    alertMessage: res.data.message,
                    alertType: "success",
                    isBlocking: true
                });

                this.props.onUpdateUser(res.data.data);
            })
            .catch(() => {
                this.setState({
                    alertMessage: "Erreur modification",
                    alertType: "error",
                    isBlocking: true
                });
            });
    };

    render() {
        const u = this.state.user;

        return (
            <div className="update-modal-overlay">
                <div className="update-modal">

                    <h3>Modifier Utilisateur</h3>

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

                                    // fermer le modal
                                    this.props.onClose();
                                }}
                            >
                                OK
                            </button>
                        </div>
                    )}

                    <form onSubmit={this.handleSubmit}>

                        <div className="update-section">
                            <div className="update-grid">

                                <input
                                    name="name"
                                    value={u.name || ""}
                                    onChange={this.handleChange}
                                    placeholder="Nom"
                                />

                                <input
                                    name="email"
                                    value={u.email || ""}
                                    onChange={this.handleChange}
                                    placeholder="Email"
                                />

                                {/* ROLE DROPDOWN */}
                                <select
                                    name="role"
                                    value={u.role || ""}
                                    onChange={this.handleChange}
                                >
                                    <option value="">-- Choisir un rôle --</option>

                                    {ROLES.map((role) => (
                                        <option key={role} value={role}>
                                            {role}
                                        </option>
                                    ))}
                                </select>

                            </div>
                        </div>

                        {/* BUTTONS */}
                        <div className="update-buttons">

                            <button type="submit" className="update-save">
                                Sauvegarder
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

                    {this.state.isBlocking && <div className="blocking-overlay"></div>}

                </div>
            </div>
        );
    }
}

export default ModifyUserModal;