import React, { Component } from "react";

class FusionClientModal extends Component {
    constructor(props) {
        super(props);

        this.state = {
            mainClientId: "",
            alertMessage: "",
            alertType: "",
            showFusionAlert: false,
             loading: false
        };
    }


    handleConfirm = () => {
        const { mainClientId } = this.state;

        if (!mainClientId) {
            this.setState({
                alertMessage: "Choisir un client principal",
                alertType: "error"
            });
            return;
        }

        // afficher popup confirmation
        this.setState({
            showFusionAlert: true
        });
    };

    handleConfirmFusion = () => {
        const { clients, onClose } = this.props;
        const { mainClientId } = this.state;

        const duplicateIds = clients
            .filter(c => c.id !== mainClientId)
            .map(c => c.id);

        // activer loading (bloque tout)
        this.setState({ loading: true });

        this.props.onConfirm(mainClientId, duplicateIds)
            .then(() => {
                // succès → fermer modal
                this.setState({ loading: false, showFusionAlert: false });
                onClose();
            })
            .catch(() => {
                // erreur → débloquer
                this.setState({ loading: false });

                this.setState({
                    alertMessage: "Erreur lors de la fusion",
                    alertType: "error"
                });
            });
    };

    handleCancelFusion = () => {
        this.setState({
            showFusionAlert: false
        });
    };


    render() {
        const { clients, onClose } = this.props;
        const { mainClientId } = this.state;

        const mainClient = clients.find(c => c.id === mainClientId);

        return (
            <div className="update-modal-overlay">
                <div className="update-modal">

                    <h3>Fusionner des Clients</h3>

                    {/* ALERT */}
                    {this.state.alertMessage && (
                        <div className={`advanced-alert ${this.state.alertType}`}>
                            <span>{this.state.alertMessage}</span>
                            <button
                                className="alert-btn"
                                onClick={() =>
                                    this.setState({ alertMessage: "", alertType: "" })
                                }
                            >
                                OK
                            </button>
                        </div>
                    )}

                    {/* LISTE */}
                    <div className="update-section">

                        <p style={{ marginBottom: "10px", fontWeight: "500" }}>
                            Sélectionnez le client principal :
                        </p>

                        <div className="fusion-list">
                            {clients.map(client => (
                                <div
                                    key={client.id}
                                    className={`fusion-item ${mainClientId === client.id ? "active" : ""}`}
                                    onClick={() => this.setState({ mainClientId: client.id })}
                                >
                                    <div className="fusion-row">

                                        {/* NOM (important) */}
                                        <div className="fusion-col fusion-main">
                                            <div className="fusion-name">{client.name}</div>
                                            <div className="fusion-sub">
                                                {client.barcode || "Sans catégorie"}
                                            </div>
                                        </div>

                                        {/* TEL */}
                                        <div className="fusion-col">
                                            <span className="fusion-label">Téléphone</span>
                                            <span>{client.phone || "-"}</span>
                                        </div>

                                        {/* EMAIL */}
                                        <div className="fusion-col">
                                            <span className="fusion-label">Email</span>
                                            <span>{client.email || "-"}</span>
                                        </div>

                                        {/* VILLE */}
                                        <div className="fusion-col">
                                            <span className="fusion-label">Ville</span>
                                            <span>{client.city || "-"}</span>
                                        </div>

                                        {/* BADGE */}
                                        {mainClientId === client.id && (
                                            <div className="fusion-badge">Principal</div>
                                        )}

                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>

                    {/* PREVIEW CLIENT PRINCIPAL */}
                    {mainClient && (
                        <div className="update-section fusion-preview">
                            <h4>Client principal sélectionné</h4>

                            <div className="fusion-preview-card">
                                <div><strong>Nom :</strong> {mainClient.name}</div>
                                <div><strong>Téléphone :</strong> {mainClient.phone || "-"}</div>
                                <div><strong>Email :</strong> {mainClient.email || "-"}</div>
                                <div><strong>Ville :</strong> {mainClient.city || "-"}</div>
                                <div><strong>Catégorie :</strong> {mainClient.barcode || "-"}</div>
                            </div>
                        </div>
                    )}

                    {/* BUTTONS */}
                    <div className="update-buttons">
                        <button
                            className="update-save"
                            onClick={this.handleConfirm}
                            disabled={this.state.loading}
                        >
                            Confirmer fusion
                        </button>

                        <button
                            className="update-close"
                            onClick={onClose}
                            disabled={this.state.loading}
                        >
                            Annuler
                        </button>
                    </div>

                </div>
                
                {/* ALERTE Confirmation Fusion */}
                {this.state.showFusionAlert && mainClient && (
                    <div className="fusion-alert">
                        <div className="fusion-alert-content">

                            {!this.state.loading ? (
                                <>
                                    <span>
                                        Tout regrouper dans "{mainClient.name} définitive ?
                                    </span>

                                    <div className="fusion-alert-actions">
                                        <button
                                            className="fusion-yes-btn"
                                            onClick={this.handleConfirmFusion}
                                        >
                                            Oui
                                        </button>

                                        <button
                                            className="fusion-no-btn"
                                            onClick={this.handleCancelFusion}
                                        >
                                            Non
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="fusion-loading-state">
                                    <div className="spinner large"></div>
                                    <p>Fusion en cours...</p>
                                </div>
                            )}

                        </div>
                    </div>
                )}
            </div>
        );
    }
}

export default FusionClientModal;

