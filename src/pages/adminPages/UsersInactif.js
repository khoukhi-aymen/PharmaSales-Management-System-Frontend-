import React, { Component } from "react";
import ReactPaginate from "react-paginate";
import axios from "../../Config/axiosConfig";
import { FiToggleRight } from "react-icons/fi";

class Users extends Component {

    constructor(props) {
        super(props);

        this.state = {
            users: [],
            filteredUsers: [],

            filters: {
                name: "",
                email: "",
                role: "",
                status: "",
                date: "",
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
            showActivateAlert: false,
            userToActivate: null,
        };
    }

    componentDidMount() {
        this.loadUsers();
    }

    // ======================
    // LOAD USERS
    // ======================

    loadUsers = () => {
        axios.get("http://localhost:8000/admin/users/inactifs", {
            withCredentials: true
        })
            .then(res => {
                const data = res.data.data || [];
                this.setState({
                    users: data,
                    filteredUsers: data
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
    // FILTRAGE PAR DATE
    // ======================

    fetchUsersByDate = () => {
        const { dateDebut, dateFin } = this.state.globalDateFilters;

        if (dateDebut && dateFin) {
            axios
                .get("http://localhost:8000/admin/users/Inactifs/filtrerParDate", {
                    params: { dateDebut, dateFin },
                    withCredentials: true
                })
                .then((res) => {
                    const data = res.data.data || [];

                    this.setState({
                        users: data,
                        filteredUsers: data,
                        currentPage: 0
                    });
                })
                .catch(() => {
                    this.setState({
                        alertMessage: "Erreur lors du filtrage par date",
                        alertType: "error"
                    });
                });
        }
    };


    // ======================
    // FILTERS
    // ======================

    handleFilterChange = (e, key) => {
        const { filters, users } = this.state;
        const value = e.target.value;

        const newFilters = { ...filters, [key]: value };

        this.setState({ filters: newFilters }, () => {
            let results = [...users];

            Object.keys(newFilters).forEach(field => {
                if (!newFilters[field]) return;

                // DATE
                if (field === "date") {
                    results = results.filter(u => {
                        const d = new Date(u.createdAt)
                            .toLocaleDateString("fr-CA");

                        return d === newFilters.date;
                    });
                }

                // TIME
                else if (field === "time") {
                    const val = newFilters[field].toLowerCase();

                    results = results.filter(u => {
                        const time = new Date(u.createdAt)
                            .toLocaleTimeString("fr-FR", {
                                hour: "2-digit",
                                minute: "2-digit"
                            })
                            .toLowerCase();

                        return time.includes(val);
                    });
                }

                // STATUS
                else if (field === "status") {
                    const val = newFilters[field].toLowerCase();

                    results = results.filter(u =>
                        (u.active ? "actif" : "inactif").includes(val)
                    );
                }

                // EMAIL
                else if (field === "email") {
                    const val = newFilters[field].toLowerCase();

                    results = results.filter(u =>
                        String(u.email || "").toLowerCase().includes(val)
                    );
                }

                // ROLE
                else if (field === "role") {
                    const val = newFilters[field].toLowerCase();

                    results = results.filter(u =>
                        String(u.role || "").toLowerCase().includes(val)
                    );
                }

                // NAME
                else {
                    const val = newFilters[field].toLowerCase();

                    results = results.filter(u =>
                        String(u.name || "").toLowerCase().includes(val)
                    );
                }
            });

            this.setState({
                filteredUsers: results,
                currentPage: 0
            });
        });
    };

    // ======================
    // DESACTIVER
    // ======================

    handleActivateClick = (user) => {
        this.setState({
            showActivateAlert: true,
            userToActivate: user
        });
    };

    handleConfirmActivate = () => {
        const { userToActivate } = this.state;

        axios.post(
            `http://localhost:8000/users/activate/${userToActivate._id}`,
            {},
            { withCredentials: true }
        )
            .then(res => {
                this.setState({
                    alertMessage: res.data.message,
                    alertType: "success",
                    showActivateAlert: false,
                    userToActivate: null
                });

                this.loadUsers();
            })
            .catch(() => {
                this.setState({
                    alertMessage: "Erreur mise à jour",
                    alertType: "error",
                    showActivateAlert: false,
                    userToActivate: null
                });
            });
    };


    // ======================
    // PAGINATION (inchangé)
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

    render() {
        const { filteredUsers, filters, currentPage, itemsPerPage } = this.state;

        const startIndex = currentPage * itemsPerPage;
        const currentItems = filteredUsers.slice(startIndex, startIndex + itemsPerPage);
        const pageCount = Math.ceil(filteredUsers.length / itemsPerPage);

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
                    <h2 className="title">Utilisateurs Inactifs</h2>

                    {/* FILTRE DATE STYLE CLIENTSINACTIFS */}
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            this.fetchUsersByDate();
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

                    {/* TABLE (adaptée) */}
                    <table className="appointments-table">
                        <thead>
                            <tr>
                                <th>Nom</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Date</th>
                                <th>Heure</th>
                                <th>Statut</th>
                                <th>Actions</th>
                            </tr>

                            <tr>
                                <th style={{ width: "25%" }}>
                                    <input
                                        type="text"
                                        placeholder="Nom"
                                        value={filters.name}
                                        onChange={(e) => this.handleFilterChange(e, "name")}
                                        style={{
                                            width: "100%",
                                        }}
                                    />
                                </th>

                                <th style={{ width: "25%" }}>
                                    <input
                                        type="text"
                                        placeholder="Email"
                                        value={filters.email}
                                        onChange={(e) => this.handleFilterChange(e, "email")}
                                        style={{
                                            width: "100%",
                                        }}
                                    />
                                </th>

                                <th style={{ width: "15%" }}>
                                    <input
                                        type="text"
                                        placeholder="Role"
                                        value={filters.role}
                                        onChange={(e) => this.handleFilterChange(e, "role")}
                                        style={{
                                            width: "100%",
                                        }}
                                    />
                                </th>

                                <th style={{ width: "15%" }}>
                                    <input
                                        type="date"
                                        value={filters.date}
                                        onChange={(e) => this.handleFilterChange(e, "date")}
                                        style={{ width: "100%" }}
                                    />
                                </th>

                                <th style={{ width: "10%" }}>
                                    <input
                                        type="text"
                                        placeholder="Heure"
                                        value={filters.time}
                                        onChange={(e) => this.handleFilterChange(e, "time")}
                                        style={{ width: "100%" }}
                                    />
                                </th>

                                <th style={{ width: "10%" }}>
                                    <input
                                        type="text"
                                        placeholder="Status"
                                        value={filters.status}
                                        onChange={(e) => this.handleFilterChange(e, "status")}
                                        style={{ width: "100%" }}
                                    />
                                </th>
                                <th></th>
                            </tr>
                        </thead>

                        <tbody>
                            {currentItems.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="no-data">
                                        Aucun user
                                    </td>
                                </tr>
                            ) : (
                                currentItems.map(user => (
                                    <tr key={user._id}>
                                        <td>{user.name}</td>
                                        <td>{user.email}</td>
                                        <td>{user.role}</td>
                                        <td>
                                            {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                                        </td>

                                        <td>
                                            {new Date(user.createdAt).toLocaleTimeString("fr-FR")}
                                        </td>

                                        <td>
                                            {user.active ? "Actif" : "Inactif"}
                                        </td>

                                        <td>
                                            <div className="actions-container">

                                                <button
                                                    className="action-btn activate-btn"
                                                    title="Activer"
                                                    onClick={() => this.handleActivateClick(user)}
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

                    <div style={{ marginTop: "10px", fontWeight: "bold" }}>
                        Total : {filteredUsers.length}
                    </div>

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

                {/* ALERT  */}
                {this.state.alertMessage && (
                    <div className={`alert-msg ${this.state.alertType}`}>
                        <div className="alert-msg-content">
                            <span>{this.state.alertMessage}</span>
                            <button
                                className="alert-ok-btn"
                                style={{ marginLeft: "10px" }}
                                onClick={() => this.setState({ alertMessage: "" })}
                            >
                                OK
                            </button>
                        </div>
                    </div>
                )}


                {/* ALERTE ACTIVATION */}

                {this.state.showActivateAlert && this.state.userToActivate && (
                    <div className="activate-alert">
                        <div className="activate-alert-content">
                            <span>
                                Voulez-vous vraiment activer l'utilisateur "
                                {this.state.userToActivate.name}" ?
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
                                            userToActivate: null
                                        })
                                    }
                                >
                                    Non
                                </button>
                            </div>
                        </div>
                    </div>
                )}





            </section>
        );
    }
}

export default Users;