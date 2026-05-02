import React, { Component } from "react";
import ReactPaginate from "react-paginate";
import axios from "../../Config/axiosConfig";
import { FiEye, FiRefreshCw, FiTrash2 } from "react-icons/fi";
import BackupDetailsModal from "../../components/BackupDetailsModal";
import CreateBackupModal from "../../components/CreateBackupModal";

class Backups extends Component {

    constructor(props) {
        super(props);

        this.state = {
            backups: [],
            filteredBackups: [],

            filters: {
                name: "",
                date: "",
                size: "",
                type: "",
                time: ""
            },
            globalDateFilters: {
                dateDebut: "",
                dateFin: ""
            },
            currentPage: 0,
            itemsPerPage: 10,
            alertMessage: "",
            alertType: "",
            loading: false,
            showCreateModal: false,
            showDeleteAlert: false,
            backupToDelete: null,
            showRestoreAlert: false,
            backupToRestore: null,
            isRestoring: false,
            selectedBackup: null,
        };
    }

    componentDidMount() {
        this.loadBackups();
    }

    // ======================
    // LOAD BACKUPS
    // ======================
    loadBackups = () => {
        axios.get("http://localhost:8000/backups", { withCredentials: true })
            .then(res => {
                const data = res.data.data || [];
                this.setState({
                    backups: data,
                    filteredBackups: data
                });
            })
            .catch(() => {
                this.setState({
                    alertMessage: "Erreur de chargement",
                    alertType: "error"
                });
            });
    };

    // ======================
    // FILTERS
    // ======================

    handleFilterChange = (e, key) => {
        const { filters, backups } = this.state;
        const value = e.target.value;

        const newFilters = { ...filters, [key]: value };

        this.setState({ filters: newFilters }, () => {
            let results = [...backups];

            Object.keys(newFilters).forEach(field => {
                if (!newFilters[field]) return;

                // filtre date
                if (field === "date") {
                    results = results.filter(b => {
                        const d = new Date(b.createdAt)
                            .toLocaleDateString("fr-CA");
                        return d === newFilters.date;
                    });
                }
                // filtre time
                else if (field === "time") {
                    const val = newFilters[field].toLowerCase();

                    results = results.filter(b => {
                        const time = new Date(b.createdAt)
                            .toLocaleTimeString("fr-FR", {
                                hour: "2-digit",
                                minute: "2-digit"
                            })
                            .toLowerCase();

                        return time.includes(val);
                    });
                }

                // filtre size (NEW)
                else if (field === "size") {
                    const val = newFilters[field].toLowerCase();

                    results = results.filter(b =>
                        String(b.size || "").toLowerCase().includes(val)
                    );
                }

                // filtre type

                else if (field === "type") {
                    const val = newFilters[field].toLowerCase();

                    results = results.filter(b =>
                        String(b.type || "").toLowerCase().includes(val)
                    );
                }

                // filtre name
                else {
                    const val = newFilters[field].toLowerCase();
                    results = results.filter(b =>
                        (b.name || "").toLowerCase().includes(val)
                    );
                }
            });

            this.setState({
                filteredBackups: results,
                currentPage: 0
            });
        });
    };

    // ======================
    // RESTORE
    // ======================
    handleRestoreClick = (backup) => {
        this.setState({
            backupToRestore: backup,
            showRestoreAlert: true
        });
    };

    handleConfirmRestore = () => {
        const { backupToRestore } = this.state;

        this.setState({
            loading: true,
            isRestoring: true
        });

        axios.post(
            "http://localhost:8000/backups/restore",
            { backupId: backupToRestore._id },
            { withCredentials: true }
        )
            .then(() => {
                this.setState({
                    alertMessage: "Restauration réussie",
                    alertType: "success",
                    showRestoreAlert: false,
                    backupToRestore: null,
                    loading: false,
                    isRestoring: false
                });

                // RECHARGER LA TABLE
                this.loadBackups();
            })
            .catch(() => {
                this.setState({
                    alertMessage: "Erreur restauration",
                    alertType: "error",
                    showRestoreAlert: false,
                    backupToRestore: null,
                    loading: false,
                    isRestoring: false
                });

                this.loadBackups(); // optionnel mais utile si backend modifie état
            });
    };

    // ======================
    // PAGINATION
    // ======================
    handlePageClick = (event) => {
        this.setState({ currentPage: event.selected });
    };

    handleItemsPerPageChange = (e) => {
        this.setState({
            itemsPerPage: parseInt(e.target.value, 10),
            currentPage: 0
        });
    };

    // ======================
    // FILTRAGE PAR DATE 
    // ======================

    fetchBackupsByDate = () => {
        const { dateDebut, dateFin } = this.state.globalDateFilters;

        if (dateDebut && dateFin) {
            axios
                .get("http://localhost:8000/backups/filtrerParDate", {
                    params: { dateDebut, dateFin },
                    withCredentials: true,
                })
                .then((res) => {
                    if (res.data && Array.isArray(res.data.data)) {
                        this.setState({
                            backups: res.data.data,
                            filteredBackups: res.data.data,
                            currentPage: 0,
                        });
                    }
                })
                .catch(() => {
                    this.setState({
                        alertMessage: "Erreur lors du filtrage par date",
                        alertType: "error",
                    });
                });
        }
    };

    // ======================
    // DELETE
    // ======================

    handleDeleteClick = (backup) => {
        this.setState({
            backupToDelete: backup,
            showDeleteAlert: true
        });
    };

    // ======================
    // VIEW DETAILS
    // ======================

    handleViewDetails = (backup) => {
        this.setState({
            selectedBackup: backup
        });
    };

    closeDetails = () => {
        this.setState({
            selectedBackup: null
        });
    };


    handleConfirmDelete = () => {
        const { backupToDelete } = this.state;

        axios.post(
            `http://localhost:8000/backups/delete/${backupToDelete._id}`,
            {},
            { withCredentials: true }
        )
            .then((res) => {
                this.setState((prev) => ({
                    backups: prev.backups.filter(b => b._id !== backupToDelete._id),
                    filteredBackups: prev.filteredBackups.filter(b => b._id !== backupToDelete._id),
                    showDeleteAlert: false,
                    backupToDelete: null,
                    alertMessage: res.data.message,
                    alertType: "success"
                }));
            })
            .catch(() => {
                this.setState({
                    showDeleteAlert: false,
                    backupToDelete: null,
                    alertMessage: "Erreur suppression backup",
                    alertType: "error"
                });
            });
    };

    render() {
        const { filteredBackups, filters, currentPage, itemsPerPage } = this.state;

        const startIndex = currentPage * itemsPerPage;
        const currentItems = filteredBackups.slice(startIndex, startIndex + itemsPerPage);
        const pageCount = Math.ceil(filteredBackups.length / itemsPerPage);

        return (
            <section className="appointments-section">

                {/* HEADER */}
                <div
                    className="table-header"
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "10px",
                    }}
                >
                  <h2 className="title">Backups</h2>

                    <button
                        className={`create-backup-btn ${this.state.loading ? "disabled-btn" : ""}`}
                        onClick={() => this.setState({ showCreateModal: true })}
                        disabled={this.state.loading}
                    >
                        + Créer
                    </button>

                    {/* FILTRE DATE STYLE CLIENTSACTIFS */}
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            this.fetchBackupsByDate();
                        }}
                        style={{ display: "flex", gap: "10px", alignItems: "center" }}
                    >
                        <div>
                            <label>Du :</label>
                            <input
                                type="date"
                                className="date-input"
                                value={this.state.globalDateFilters?.dateDebut || ""}
                                onChange={(e) =>
                                    this.setState({
                                        globalDateFilters: {
                                            ...this.state.globalDateFilters,
                                            dateDebut: e.target.value,
                                        },
                                    })
                                }
                            />
                        </div>

                        <div>
                            <label>Au :</label>
                            <input
                                type="date"
                                className="date-input"
                                value={this.state.globalDateFilters?.dateFin || ""}
                                onChange={(e) =>
                                    this.setState({
                                        globalDateFilters: {
                                            ...this.state.globalDateFilters,
                                            dateFin: e.target.value,
                                        },
                                    })
                                }
                            />
                        </div>

                        <button className="add-stock-btn">
                            Filtrer
                        </button>
                    </form>
                </div>

                <div className="table-wrapper">

                    {/* PAGINATION CONTROL */}
                    <div className="pagination-controls">
                        <label>Afficher: </label>
                        <select
                            value={itemsPerPage}
                            onChange={this.handleItemsPerPageChange}
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                    </div>

                    {/* TABLE */}
                    <table className="appointments-table">
                        <thead>
                            <tr>
                                <th>Nom</th>
                                <th>Date</th>
                                <th>Heure</th>
                                <th>Taille</th>
                                <th>Type</th>
                                <th>Actions</th>
                            </tr>

                            {/* FILTRES LOCAUX */}
                            <tr>
                                <th style={{ width: "20%" }}>
                                    <input
                                        type="text"
                                        placeholder="Rechercher Nom..."
                                        value={filters.name}
                                        onChange={(e) => this.handleFilterChange(e, "name")}
                                        style={{
                                            width: "100%",
                                        }}
                                    />
                                </th>

                                <th style={{ width: "20%" }}>
                                    <input
                                        type="date"
                                        value={filters.date}
                                        onChange={(e) => this.handleFilterChange(e, "date")}
                                        style={{
                                            width: "100%",
                                        }}
                                    />
                                </th>


                                <th style={{ width: "20%" }}>
                                    <input
                                        type="text"
                                        placeholder="Heure"
                                        value={filters.time}
                                        onChange={(e) => this.handleFilterChange(e, "time")}
                                        style={{
                                            width: "100%",
                                        }}
                                    />
                                </th>


                                <th style={{ width: "20%" }}>
                                    <input
                                        type="text"
                                        placeholder="Taille"
                                        value={filters.size}
                                        onChange={(e) => this.handleFilterChange(e, "size")}
                                        style={{
                                            width: "100%",
                                        }}
                                    />
                                </th>


                                <th style={{ width: "20%" }}>
                                    <input
                                        type="text"
                                        placeholder="Type"
                                        value={filters.type}
                                        onChange={(e) => this.handleFilterChange(e, "type")}
                                        style={{
                                            width: "100%",
                                        }}
                                    />
                                </th>



                                <th></th>
                            </tr>
                        </thead>

                        <tbody>
                            {currentItems.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="no-data">
                                        Aucun backup trouvé
                                    </td>
                                </tr>
                            ) : (
                                currentItems.map((backup) => (
                                    <tr key={backup._id}>

                                        {/* NOM */}
                                        <td>{backup.name}</td>

                                        {/* DATE */}
                                        <td>
                                            {new Date(backup.createdAt).toLocaleDateString("fr-FR")}
                                        </td>

                                        {/* HEURE COMPLETE */}

                                        <td>
                                            {new Date(backup.createdAt).toLocaleTimeString("fr-FR")}
                                        </td>


                                        {/* TAILLE */}
                                        <td>{backup.size || "-"}</td>

                                        {/* TYPE BACKUP */}
                                        <td>
                                            {backup.type === "MONGO" ? "MongoDB" : "Full"}
                                        </td>

                                        {/* ACTIONS */}
                                        <td>
                                            <div className="actions-container">

                                                {/* VIEW DETAILS */}
                                                <button
                                                    className="action-btn view-btn"
                                                    title="Voir détails"
                                                    onClick={() => this.handleViewDetails(backup)}
                                                >
                                                    <FiEye size={18} />
                                                </button>

                                                {/* RESTORE */}
                                                <button
                                                    className="action-btn update-btn"
                                                    onClick={() => this.handleRestoreClick(backup)}
                                                    disabled={this.state.isRestoring}
                                                    title="Restaurer"
                                                >
                                                    <FiRefreshCw size={18} />
                                                </button>

                                                {/* DELETE */}
                                                <button
                                                    className="action-btn delete-btn"
                                                    onClick={() => this.handleDeleteClick(backup)}
                                                    disabled={this.state.isRestoring}
                                                    title="Supprimer"
                                                >
                                                    <FiTrash2 size={18} />
                                                </button>

                                            </div>
                                        </td>

                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    {/* TOTAL */}
                    <div style={{ marginTop: "10px", fontWeight: "bold" }}>
                        Total : {filteredBackups.length}
                    </div>

                    {/* PAGINATION */}
                    <ReactPaginate
                        previousLabel={"← Précédent"}
                        nextLabel={"Suivant →"}
                        breakLabel={"..."}
                        pageCount={pageCount}
                        onPageChange={this.handlePageClick}
                        containerClassName={"pagination"}
                        activeClassName={"active"}
                    />
                </div>

                {/* ALERT */}
                {this.state.alertMessage && (
                    <div className={`alert-msg ${this.state.alertType}`}>
                        <div className="alert-msg-content">
                            <span>{this.state.alertMessage}</span>
                            <button
                                className="alert-ok-btn"
                                onClick={() =>
                                    this.setState({ alertMessage: "", alertType: "" })
                                }
                            >
                                OK
                            </button>
                        </div>
                    </div>
                )}

                {/* Modale pour afficher créer backup */}

                {this.state.showCreateModal && (
                    <CreateBackupModal
                        onClose={() => this.setState({ showCreateModal: false })}
                        onSuccess={() => this.loadBackups()}
                    />
                )}

                {/* ALERTE CONFIRMATION SUPPRESSION */}

                {this.state.showDeleteAlert && this.state.backupToDelete && (
                    <div className="delete-alert">
                        <div className="delete-alert-content">

                            <span>
                                Voulez-vous vraiment supprimer le backup "
                                {this.state.backupToDelete?.name}" ?
                            </span>

                            <div className="delete-alert-actions">

                                <button
                                    className="delete-yes-btn"
                                    onClick={this.handleConfirmDelete}
                                >
                                    Oui
                                </button>

                                <button
                                    className="delete-no-btn"
                                    onClick={() =>
                                        this.setState({
                                            showDeleteAlert: false,
                                            backupToDelete: null
                                        })
                                    }
                                >
                                    Non
                                </button>

                            </div>
                        </div>
                    </div>
                )}

                {/* ALERTE CONFIRMATION RESTORE */}

                {this.state.showRestoreAlert && this.state.backupToRestore && (
                    <div className="restore-alert">
                        <div className="restore-alert-content">

                            {!this.state.isRestoring ? (
                                <>
                                    <span>
                                        Voulez-vous vraiment restaurer le backup "
                                        {this.state.backupToRestore?.name}" ?
                                    </span>

                                    <div className="restore-alert-actions">

                                        <button
                                            className="restore-yes-btn"
                                            onClick={this.handleConfirmRestore}
                                        >
                                            Oui
                                        </button>

                                        <button
                                            className="restore-no-btn"
                                            onClick={() =>
                                                this.setState({
                                                    showRestoreAlert: false,
                                                    backupToRestore: null
                                                })
                                            }
                                        >
                                            Non
                                        </button>

                                    </div>
                                </>
                            ) : (
                                <div className="fusion-loading-state">
                                    <div className="spinner large"></div>
                                    <p>Restauration en cours...</p>
                                </div>
                            )}

                        </div>
                    </div>
                )}


                {/* Modale pour afficher voir details backup */}
                {this.state.selectedBackup && (
                    <BackupDetailsModal
                        backup={this.state.selectedBackup}
                        onClose={this.closeDetails}
                    />
                )}

            </section>
        );
    }
}

export default Backups;