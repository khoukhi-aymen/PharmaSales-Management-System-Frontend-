import React, { Component } from "react";
import ReactPaginate from "react-paginate";
import axios from "../../Config/axiosConfig";
import {FiTrash2 } from "react-icons/fi";
import {FiToggleRight } from "react-icons/fi";

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
            },
            globalDateFilters: {
                dateDebut: "",
                dateFin: "",
            },
            filteredClients: [],
            currentPage: 0,
            itemsPerPage: 10,
            itemToActivate: null,
            showActivateAlert: false,
            showDeleteAlert: false,
            itemToDelete: null,
            alertMessage: "",
            alertType: "",
        };
    }

    componentDidMount() {
        axios
            .get("http://localhost:8000/biztrack/get/Tier/inactifs", { withCredentials: true })
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
                    alertMessage:"Erreur de chargement",
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
                .get(`http://localhost:8000/biztrack/get/Tier/inactifs/FiltrerParDate`, {
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

    handleActivateClick = (item) => {
        this.setState({
            itemToActivate: item,
            showActivateAlert: true
        });
    };

    handleDeleteClick = (item) => {
        this.setState({
            itemToDelete: item,
            showDeleteAlert: true
        });
    };

    handleConfirmDelete = () => {
        const { itemToDelete } = this.state;

        axios.post(
            `http://localhost:8000/biztrack/Tier/inactifs/Supprimer/${itemToDelete._id}`,
            {},
            { withCredentials: true }
        )
            .then((res) => {
                this.setState((prev) => ({
                    clients: prev.clients.filter(c => c._id !== itemToDelete._id),
                    filteredClients: prev.filteredClients.filter(c => c._id !== itemToDelete._id),
                    showDeleteAlert: false,
                    itemToDelete: null,
                    alertMessage: res.data.message,
                    alertType: "success"
                }));
            })
            .catch(() => {
                this.setState({
                    showDeleteAlert: false,
                    itemToDelete: null,
                    alertMessage: "Erreur suppression",
                    alertType: "error"
                });
            });
    };

    handleConfirmActivate = () => {
        const { itemToActivate } = this.state;

        axios
            .post(
                `http://localhost:8000/biztrack/Tier/inactifs/Activer/${itemToActivate._id}`,
                {},
                { withCredentials: true }
            )
            .then((res) => {
                this.setState((prevState) => ({
                    clients: prevState.clients.filter(
                        (c) => c._id !== itemToActivate._id
                    ),
                    filteredClients: prevState.filteredClients.filter(
                        (c) => c._id !== itemToActivate._id
                    ),
                    showActivateAlert: false,
                    alertMessage:
                        res.data.message,
                    alertType: "success",
                    itemToActivate: null,
                }));
            })
            .catch((err) => {
                this.setState({
                    showActivateAlert: false,
                    alertMessage: "Erreur lors de l'activation",
                    alertType: "error",
                    itemToActivate: null,
                });
            });
    };


    handleFilterChange = (e, key) => {
        const { filters, clients } = this.state;
        const value = e.target.value.toLowerCase();

        const newFilters = { ...filters, [key]: value };

        this.setState({ filters: newFilters }, () => {

            let results = [...clients];

            // FILTRE PAR COLONNE (SÉPARÉ)
            Object.keys(newFilters).forEach((field) => {
                if (!newFilters[field]) return;

                if (field === "date") {
                    results = results.filter(client => {
                        if (!client.created_at) return false;

                        const clientDate = new Date(client.created_at)
                            .toLocaleDateString("fr-CA");

                        return clientDate === newFilters.date;
                    });
                } else {
                    results = results.filter(client => {
                        const value = (client[field] || "").toString().toLowerCase();
                        return value.includes(newFilters[field]);
                    });
                }
            });

            this.setState({
                filteredClients: results,
                currentPage: 0
            });
        });
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
                    <h2 className="title">Liste des Articles inactifs</h2>

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
                                <th>Nom</th>
                                <th>Catégorie</th>
                                <th>Type</th>
                                <th>Téléphone</th>
                                <th>Email</th>
                                <th>Ville</th>
                                <th>Date création</th>
                                <th>Actions</th>
                            </tr>

                            <tr>
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

                                <th></th>
                            </tr>
                        </thead>

                        <tbody>
                            {currentItems.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="no-data">
                                        Aucun client trouvé.
                                    </td>
                                </tr>
                            ) : (
                                currentItems.map((item) => (
                                    <tr key={item._id}>
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
                                        <td>
                                            <div className="actions-container">
                                                <button
                                                    className="action-btn delete-btn"
                                                    onClick={() => this.handleDeleteClick(item)}
                                                    title="Supprimer"
                                                >
                                                    <FiTrash2 size={18} />
                                                </button>

                                                <button
                                                    className="action-btn activate-btn"
                                                    title="Activer"
                                                    onClick={() => this.handleActivateClick(item)}
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



                {/* ALERTE ACTIVATION */}

                {this.state.showActivateAlert && this.state.itemToActivate && (
                    <div className="activate-alert">
                        <div className="activate-alert-content">
                            <span>
                                Voulez-vous vraiment activer le client "
                                {this.state.itemToActivate?.name}" ?
                            </span>

                            <div className="activate-alert-actions">
                                <button
                                    className="activate-yes-btn"
                                    onClick={this.handleConfirmActivate}
                                >
                                    Oui
                                </button>

                                <button
                                    className="activate-no-btn"
                                    onClick={() =>
                                        this.setState({
                                            showActivateAlert: false,
                                            itemToActivate: null
                                        })
                                    }
                                >
                                    Non
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ALERTE SUPPRESSION */}

                {this.state.showDeleteAlert && this.state.itemToDelete && (
                    <div className="delete-alert">
                        <div className="delete-alert-content">
                            <span>
                                Voulez-vous vraiment supprimer le client "
                                {this.state.itemToDelete?.name}" ?
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
                                            itemToDelete: null
                                        })
                                    }
                                >
                                    Non
                                </button>
                            </div>
                        </div>
                    </div>
                )}



                {/* Message OK après succès / erreur */}
                {this.state.alertMessage && (
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