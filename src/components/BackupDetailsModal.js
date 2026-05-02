import React, { Component } from "react";

class BackupDetailsModal extends Component {

    render() {

        const { backup, onClose } = this.props;

        if (!backup) return null;

        return (
            <div className="update-modal-overlay">
                <div className="update-modal">

                    <h3>Détails du backup</h3>

                    <div className="update-section">

                        <div><strong>Nom :</strong> {backup.name}</div>

                        <div><strong>Description :</strong> {backup.description || "-"}</div>

                        <div><strong>Type :</strong> {backup.type}</div>

                        <div><strong>Taille :</strong> {backup.size}</div>

                        <div>
                            <strong>Date :</strong>{" "}
                            {new Date(backup.createdAt).toLocaleString("fr-FR")}
                        </div>

                        <div>
                            <strong>Fichier :</strong> {backup.filePath}
                        </div>

                    </div>

                    {/* SNAPSHOT STATS */}
                    <div className="update-section">
                        <h4>Statistiques snapshot</h4>

                        <div>
                            Clients actifs : {backup.statsSnapshot?.activeClients}
                        </div>

                        <div>
                            Clients inactifs : {backup.statsSnapshot?.inactiveClients}
                        </div>

                        <div>
                            Clients supprimés : {backup.statsSnapshot?.deletedClients}
                        </div>

                        <div>
                            Users actifs : {backup.statsSnapshot?.activeUsers}
                        </div>

                        <div>
                            Users inactifs : {backup.statsSnapshot?.inactiveUsers}
                        </div>

                        <div>
                            Logs : {backup.statsSnapshot?.logs}
                        </div>

                        <div>
                            Backups : {backup.statsSnapshot?.backups}
                        </div>
                    </div>

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

export default BackupDetailsModal;