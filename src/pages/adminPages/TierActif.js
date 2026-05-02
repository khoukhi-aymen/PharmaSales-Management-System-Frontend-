import React, { Component } from "react";
import ReactPaginate from "react-paginate";
import axios from "../../Config/axiosConfig";
import { FiEdit } from "react-icons/fi";
import {FiToggleRight } from "react-icons/fi";
import ModifyClientModal from "../../components/ModifyClientModal";
import FusionClientModal from "../../components/FusionClientModal";

class ClientsActifs extends Component {
    constructor(props) {
        super(props);
        this.state = {
            clients: [],
            filters: {
                name: "",
                barcode: "",
                type: "",
                phone: "",
                email: "",
                city: "",
                date: "",
                operationsCount: ""
            },
            globalDateFilters: {
                dateDebut: "",
                dateFin: "",
            },
            filteredClients: [],
            currentPage: 0,
            itemsPerPage: 10,
            itemToDeactivate: null,
            showDeactivateAlert: false,
            alertMessage: "",
            alertType: "",
            showModifyModal: false,
            itemToModify: null,
            fusionMode: false,
            selectedClients: [],
            showFusionModal: false,
        };
    }

    componentDidMount() {
        axios
            .get("http://localhost:8000/biztrack/get/Tier/Actif", { withCredentials: true })
            .then((res) => {

                if (res.data && Array.isArray(res.data.data)) {

                    //PLUS DE FILTRE
                    const allClients = res.data.data;
                    this.setState({
                        clients: allClients,
                        filteredClients: allClients,
                    });
                }
            })
            .catch((err) => {
                this.setState({
                    alertMessage: "Erreur de chargement" ,
                    alertType: "error",
                    clients: [],
                    filteredClients: []
                });
            });
    }

    handlePageClick = (event) => {
        this.setState({ currentPage: event.selected });
    };

    handleItemsPerPageChange = (e) => {
        this.setState({
            itemsPerPage: parseInt(e.target.value, 10),
            currentPage: 0,
        });
    };


    fetchClientsByDate = () => {
        const { dateDebut, dateFin } = this.state.globalDateFilters;

        if (dateDebut && dateFin) {
            axios
                .get(`http://localhost:8000/biztrack/get/Tier/Actif/FiltrerParDate`, {
                    params: { dateDebut, dateFin },
                    withCredentials: true,
                })
                .then((res) => {
                    if (res.data && Array.isArray(res.data.data)) {

                        this.setState({
                            clients: res.data.data,
                            filteredClients: res.data.data,
                            currentPage: 0,
                        });

                    }
                })
                .catch((err) => {
                    this.setState({
                        alertMessage: "Erreur lors du filtrage par date",
                        alertType: "error",
                    });
                });
        }
    };

    handleDeactivateClick = (item) => {
        this.setState({
            itemToDeactivate: item,
            showDeactivateAlert: true
        });
    };

    handleConfirmDeactivate = () => {
        const { itemToDeactivate } = this.state;

        axios
            .post(
                `http://localhost:8000/biztrack/Tier/Actif/Desactiver/${itemToDeactivate._id}`,
                {},
                { withCredentials: true }
            )
            .then((res) => {
                this.setState((prevState) => ({
                    clients: prevState.clients.filter(
                        (c) => c._id !== itemToDeactivate._id
                    ),
                    filteredClients: prevState.filteredClients.filter(
                        (c) => c._id !== itemToDeactivate._id
                    ),
                    showDeactivateAlert: false,
                    alertMessage:
                        res.data.message,
                    alertType: "success",
                    itemToDeactivate: null,
                }));
            })
            .catch((err) => {
                this.setState({
                    showDeactivateAlert: false,
                    alertMessage: "Erreur lors de la désactivation",
                    alertType: "error",
                    itemToDeactivate: null,
                });
            });
    };

    handleEditClick = (id) => {
        axios
            .get(`http://localhost:8000/biztrack/Tier/Actif/Modifier/${id}`, {
                withCredentials: true
            })
            .then((res) => {
                this.setState({
                    showModifyModal: true,
                    itemToModify: res.data.data
                });
            })
            .catch((err) => {
                this.setState({
                    alertMessage:"Erreur de chargement",
                    alertType: "error"
                });
            });
    };

    handleFilterChange = (e, key) => {
        const { filters, clients } = this.state;
        const value = e.target.value;

        const newFilters = { ...filters, [key]: value };

        this.setState({ filters: newFilters }, () => {

            let results = [...clients];

            Object.keys(newFilters).forEach((field) => {

                if (!newFilters[field]) return;

                // ======================
                // FILTRE DATE
                // ======================
                if (field === "date") {

                    results = results.filter(client => {
                        if (!client.created_at) return false;

                        const clientDate = new Date(client.created_at)
                            .toLocaleDateString("fr-CA");

                        return clientDate === newFilters.date;
                    });
                }

                // ======================
                // FILTRE OPERATIONS COUNT
                // ======================
                else if (field === "operationsCount") {

                    results = results.filter(client => {
                        return String(client.operationsCount || "")
                            .includes(String(newFilters.operationsCount));
                    });
                }

                // ======================
                // FILTRE TEXTE NORMAL
                // ======================
                else {

                    const searchValue = newFilters[field].toString().toLowerCase();

                    results = results.filter(client => {
                        const clientValue = (client[field] || "")
                            .toString()
                            .toLowerCase();

                        return clientValue.includes(searchValue);
                    });
                }
            });

            this.setState({
                filteredClients: results,
                currentPage: 0
            });
        });
    };


    // handleFilterChange = (e, key) => {
    //     const { filters, clients } = this.state;
    //     const value = e.target.value;

    //     const newFilters = { ...filters, [key]: value };

    //     this.setState({ filters: newFilters }, () => {

    //         let results = [...clients];

    //         // FILTRE DATE
    //         if (newFilters.date) {
    //             results = results.filter(client => {
    //                 if (!client.created_at) return false;

    //                 const clientDate = new Date(client.created_at)
    //                     .toLocaleDateString("fr-CA");

    //                 return clientDate === newFilters.date;
    //             });
    //         }

    //         // FILTRE TEXTE AVEC FUSE
    //         const fuse = new Fuse(results, {
    //             keys: ["name", "barcode", "type", "phone", "email", "city"],
    //             threshold: 0.3,
    //             ignoreLocation: true
    //         });

    //         Object.keys(newFilters).forEach((field) => {
    //             if (!newFilters[field] || field === "date") return;

    //             results = fuse.search(newFilters[field]).map(r => r.item);
    //         });

    //         this.setState({
    //             filteredClients: results,
    //             currentPage: 0
    //         });
    //     });
    // };

    handleFusion = (mainClientId, duplicateIds) => {
        return axios.post(
            "http://localhost:8000/biztrack/Tier/Fusion",
            { mainClientId, duplicateIds },
            { withCredentials: true }
        )
            .then(() => {
                this.setState({
                    alertMessage: "Fusion réalisée avec succès",
                    alertType: "success",
                    fusionMode: false,
                    selectedClients: [],
                    showFusionModal: false
                });

                this.componentDidMount();
            })
            .catch((err) => {
                this.setState({
                    alertMessage: "Erreur lors de la fusion",
                    alertType: "error"
                });

                return Promise.reject(err); // IMPORTANT
            });
    };

    refreshClients = () => {
        this.componentDidMount();
    };


    render() {
        const { filteredClients, filters, currentPage, itemsPerPage } = this.state;

        const startIndex = currentPage * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const currentItems = filteredClients.slice(startIndex, endIndex);
        const pageCount = Math.ceil(filteredClients.length / itemsPerPage);

        return (
            <section className="appointments-section">
                <div
                    className="table-header"
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "10px",
                    }}
                >
                    <h2 className="title">Liste des clients / Fournisseurs actifs</h2>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>

                        {!this.state.fusionMode ? (
                            <button
                                className="fusion-btn"
                                onClick={() => this.setState({ fusionMode: true })}
                            >
                                Mode fusion
                            </button>
                        ) : (
                            <>
                                <button
                                    className="cancel-fusion-btn"
                                    onClick={() =>
                                        this.setState({
                                            fusionMode: false,
                                            selectedClients: []
                                        })
                                    }
                                >
                                    Annuler
                                </button>

                                {this.state.selectedClients.length >= 2 && (
                                    <button
                                        className="confirm-fusion-btn"
                                        onClick={() => this.setState({ showFusionModal: true })}
                                    >
                                        Fusionner ({this.state.selectedClients.length})
                                    </button>
                                )}
                            </>
                        )}

                    </div>

                    {/* form filtrage par date  */}
                    <form
                        onSubmit={(e) => {
                            e.preventDefault(); // empêche refresh page
                            this.fetchClientsByDate(); //envoie requête
                        }}
                        style={{ display: "flex", gap: "10px", alignItems: "center" }}
                    >
                        <div>
                            <label>Du :</label>
                            <input
                                type="date"
                                className="date-input"
                                value={this.state.globalDateFilters.dateDebut || ""}
                                onChange={(e) =>
                                    this.setState({
                                        globalDateFilters: {
                                            ...this.state.globalDateFilters,
                                            dateDebut: e.target.value
                                        }
                                    })
                                }
                            />
                        </div>

                        <div>
                            <label>Au :</label>
                            <input
                                type="date"
                                className="date-input"
                                value={this.state.globalDateFilters.dateFin || ""}
                                onChange={(e) =>
                                    this.setState({
                                        globalDateFilters: {
                                            ...this.state.globalDateFilters,
                                            dateFin: e.target.value
                                        }
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

                    {/* message d'elerte de fusisoner au moins 2 clients */}

                    {this.state.fusionMode && (
                        <div style={{
                            marginBottom: "10px",
                            background: "#eef2ff",
                            padding: "8px",
                            borderRadius: "5px",
                            fontWeight: "500"
                        }}>
                            Mode fusion actif : sélectionnez au moins 2 clients
                        </div>
                    )}
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

                    <table className="appointments-table">
                        <thead>
                            <tr>
                                {this.state.fusionMode && <th></th>}
                                <th>Nom</th>
                                <th>Catégorie</th>
                                <th>Type</th>
                                <th>Téléphone</th>
                                <th>Email</th>
                                <th>Ville</th>
                                <th>Date création</th>
                                <th>Opérations</th>
                                <th>Actions</th>
                            </tr>

                            <tr>
                                {this.state.fusionMode && <th></th>}
                                <th>
                                    <input
                                        type="text"
                                        placeholder="Rechercher nom"
                                        value={filters.name}
                                        onChange={(e) => this.handleFilterChange(e, "name")}
                                        className="filter-input"
                                        style={{ width: "150px" }}
                                    />
                                </th>

                                <th>
                                    <input
                                        type="text"
                                        placeholder="Catégorie"
                                        value={filters.barcode}
                                        onChange={(e) => this.handleFilterChange(e, "barcode")}
                                        className="filter-input"
                                    />
                                </th>

                                <th>
                                    <input
                                        type="text"
                                        placeholder="Type"
                                        value={filters.type}
                                        onChange={(e) => this.handleFilterChange(e, "type")}
                                        className="filter-input"
                                        style={{ width: "150px" }}
                                    />
                                </th>

                                <th>
                                    <input
                                        type="text"
                                        placeholder="Téléphone"
                                        value={filters.phone}
                                        onChange={(e) => this.handleFilterChange(e, "phone")}
                                        className="filter-input"
                                        style={{ width: "150px" }}
                                    />
                                </th>

                                <th>
                                    <input
                                        type="text"
                                        placeholder="Email"
                                        value={filters.email}
                                        onChange={(e) => this.handleFilterChange(e, "email")}
                                        className="filter-input"
                                        style={{ width: "150px" }}
                                    />
                                </th>

                                <th>
                                    <input
                                        type="text"
                                        placeholder="Ville"
                                        value={filters.city}
                                        onChange={(e) => this.handleFilterChange(e, "city")}
                                        className="filter-input"
                                        style={{ width: "150px" }}
                                    />
                                </th>

                                <th>
                                    <input
                                        type="date"
                                        value={filters.date}
                                        onChange={(e) => this.handleFilterChange(e, "date")}
                                        className="filter-input"
                                        style={{ width: "150px" }}
                                    />
                                </th>
                                <th>
                                    <input
                                        type="text"
                                        placeholder="Opérations"
                                        value={filters.operationsCount}
                                        onChange={(e) => this.handleFilterChange(e, "operationsCount")}
                                        className="filter-input"
                                        style={{ width: "120px" }}
                                    />
                                </th>
                                <th></th>
                            </tr>
                        </thead>

                        <tbody>
                            {currentItems.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="no-data">
                                        Aucun client trouvé.
                                    </td>
                                </tr>
                            ) : (
                                currentItems.map((item) => (
                                    <tr key={item._id}>

                                        {this.state.fusionMode && (
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    checked={this.state.selectedClients.some(c => c._id === item._id)}
                                                    onChange={(e) => {
                                                        const { selectedClients } = this.state;

                                                        if (e.target.checked) {
                                                            this.setState({
                                                                selectedClients: [...selectedClients, item]
                                                            });
                                                        } else {
                                                            this.setState({
                                                                selectedClients: selectedClients.filter(c => c._id !== item._id)
                                                            });
                                                        }
                                                    }}
                                                />
                                            </td>
                                        )}

                                        <td>{item.name}</td>
                                        <td>{item.barcode}</td>
                                        <td>{item.type}</td>
                                        <td>{item.phone}</td>
                                        <td>{item.email}</td>
                                        <td>{item.city}</td>
                                        <td>
                                            {item.created_at
                                                ? new Date(item.created_at).toLocaleDateString("fr-CA")
                                                : ""}
                                        </td>
                                        <td>{item.operationsCount}</td>
                                        <td>
                                            <div className="actions-container">
                                                <button
                                                    className={`action-btn update-btn ${this.state.fusionMode ? "disabled-btn" : ""}`}
                                                    disabled={this.state.fusionMode}
                                                    onClick={() => this.handleEditClick(item._id)}
                                                >
                                                    <FiEdit size={18} />
                                                </button>

                                                <button
                                                    className={`action-btn deactivate-btn ${this.state.fusionMode ? "disabled-btn" : ""}`}
                                                    disabled={this.state.fusionMode}
                                                    onClick={() => this.handleDeactivateClick(item)}
                                                >
                                                    <FiToggleRight size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>


                    {/* Nombre total d'éléments */}
                    <div style={{ marginTop: "10px", fontWeight: "bold" }}>
                        Total : {filteredClients.length}
                    </div>


                    {/* Pagination */}

                    <ReactPaginate
                        previousLabel={"← Prédédent"}
                        nextLabel={"Suivant →"}
                        breakLabel={"..."}
                        pageCount={pageCount}
                        onPageChange={this.handlePageClick}
                        containerClassName={"pagination"}
                        activeClassName={"active"}
                    />
                </div>



                {/* Modale pour fussioner des Clients/Fournisseurs */}

                {this.state.showFusionModal && (
                    <FusionClientModal
                        clients={this.state.selectedClients}
                        onClose={() =>
                            this.setState({ showFusionModal: false })
                        }
                        onConfirm={(mainClientId, duplicateIds) => {
                            return this.handleFusion(mainClientId, duplicateIds);
                        }}
                    />
                )}

                {/* Modale modifier un Client/Fournisseur */}

                {this.state.showModifyModal && (
                    <ModifyClientModal
                        item={this.state.itemToModify}
                        onClose={() => this.setState({ showModifyModal: false, itemToModify: null })}
                        onRefresh={this.refreshClients}
                        onUpdateClient={(updatedClient) => {
                            this.setState((prevState) => ({
                                clients: prevState.clients.map(c =>
                                    c._id === updatedClient._id ? updatedClient : c
                                ),
                                filteredClients: prevState.filteredClients.map(c =>
                                    c._id === updatedClient._id ? updatedClient : c
                                )
                            }));
                        }}
                    />
                )}


                {/* ALERTE DÉSACTIVATION */}

                {this.state.showDeactivateAlert && this.state.itemToDeactivate && (
                    <div className="deactivate-alert">
                        <div className="deactivate-alert-content">
                            <span>
                                Voulez-vous vraiment désactiver le client "
                                {this.state.itemToDeactivate.name}" ?
                            </span>

                            <div className="deactivate-alert-actions">
                                <button
                                    className="deactivate-yes-btn"
                                    onClick={this.handleConfirmDeactivate}
                                >
                                    Oui
                                </button>

                                <button
                                    className="deactivate-no-btn"
                                    onClick={() =>
                                        this.setState({
                                            showDeactivateAlert: false,
                                            itemToDeactivate: null
                                        })
                                    }
                                >
                                    Non
                                </button>
                            </div>
                        </div>
                    </div>
                )}



                



                {/* Message OK après succès de désactivation / erreur de désactivation */}
                {this.state.alertMessage && !this.state.showDeleteAlert && (
                    <div className={`alert-msg ${this.state.alertType}`}>
                        <div className="alert-msg-content">
                            <span>{this.state.alertMessage}</span>
                            <button
                                className="alert-ok-btn"
                                style={{ marginLeft: "10px" }}
                                onClick={() => this.setState({ alertMessage: "", alertType: "" })}
                            >
                                OK
                            </button>
                        </div>
                    </div>
                )}


            </section>
        );
    }
}

export default ClientsActifs;