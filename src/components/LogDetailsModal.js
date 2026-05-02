import React, { Component } from "react";

class LogDetailsModal extends Component {

    renderDetails = (details) => {

        if (!details) return <p>Aucun détail</p>;

        // champs à ignorer
        const excludedFields = ["user"];

        const renderValue = (value) => {

            if (Array.isArray(value)) {
                return (
                    <div className="detail-list">
                        {value.map((item, i) => (
                            <div key={i} className="detail-card">
                                {renderObject(item)}
                            </div>
                        ))}
                    </div>
                );
            }

            if (typeof value === "object" && value !== null) {
                return renderObject(value);
            }

            return <span className="detail-value">{value?.toString() || "-"}</span>;
        };

        const renderObject = (obj) => {
            return (
                <div className="detail-object">
                    {Object.keys(obj)
                        .filter(k => !excludedFields.includes(k)) // filtre ici aussi
                        .map((k, i) => (
                            <div key={i} className="detail-row">
                                <span className="detail-label">{k}</span>
                                <span className="detail-separator">:</span>
                                <span className="detail-value">
                                    {typeof obj[k] === "object"
                                        ? renderValue(obj[k])
                                        : obj[k]?.toString() || "-"}
                                </span>
                            </div>
                        ))}
                </div>
            );
        };

        return (
            <div className="details-grid">
                {Object.keys(details)
                    .filter(key => !excludedFields.includes(key)) // filtre principal
                    .map((key, index) => (
                        <div key={index} className="detail-section">

                            <div className="detail-title">
                                {key}
                            </div>

                            <div className="detail-content">
                                {renderValue(details[key])}
                            </div>

                        </div>
                    ))}
            </div>
        );
    };

    render() {

        const { log, onClose } = this.props;

        if (!log) return null;

        return (
            <div className="update-modal-overlay">
                <div className="update-modal">

                    <h3>Détails de l'action</h3>

                    {/* INFO PRINCIPALE */}
                    <div className="update-section">
                        <div><strong>Action :</strong> {log.action}</div>
                        <div><strong>Utilisateur :</strong> {log.user?.name}</div>
                        <div><strong>Email :</strong> {log.user?.email}</div>
                        <div><strong>Rôle :</strong> {log.user?.role}</div>

                        <div>
                            <strong>Date :</strong>{" "}
                            {new Date(log.createdAt).toLocaleString("fr-FR")}
                        </div>
                    </div>

                    {/* DETAILS */}
                    <div className="update-section">
                        <h4>Détails techniques</h4>

                        <div className="details-container">
                            {this.renderDetails(log.details)}
                        </div>
                    </div>

                    {/* BUTTON */}
                    <div className="update-buttons">
                        <button className="update-close" onClick={onClose}>
                            Fermer
                        </button>
                    </div>

                </div>
            </div>
        );
    }
}

export default LogDetailsModal;