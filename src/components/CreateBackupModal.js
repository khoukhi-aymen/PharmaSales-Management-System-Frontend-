import React, { Component } from "react";
import axios from "../Config/axiosConfig";

class CreateBackupModal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            name: "",
            description: "",
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
            description: this.state.description
        };

        axios.post(
            "http://localhost:8000/backups/create",
            data,
            { withCredentials: true }
        )
        .then((res) => {
            this.setState({
                alertMessage: "Backup créé avec succès",
                alertType: "success",
                loading: false,
                isBlocking: true
            });

            // refresh parent
            this.props.onSuccess();
        })
        .catch(() => {
            this.setState({
                alertMessage: "Erreur création backup",
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

                    <h3>Créer un Backup</h3>

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

                                    // fermer le modal COMPLET
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
                                    value={this.state.name}
                                    onChange={this.handleChange}
                                    placeholder="Nom du backup"
                                    required
                                />

                                <input
                                    name="description"
                                    value={this.state.description}
                                    onChange={this.handleChange}
                                    placeholder="Description (optionnel)"
                                />

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
                    {/* ALERTE WAITING CREATE BACKUP */}
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

export default CreateBackupModal;