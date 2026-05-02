import React, { Component } from "react";
import ReactPaginate from "react-paginate";
import axios from "../../Config/axiosConfig";
import { FiEye } from "react-icons/fi";
import LogDetailsModal from "../../components/LogDetailsModal";
class LogsActivite extends Component {
    constructor(props) {
        super(props);
        this.state = {
            logs: [],
            filters: {
                action: "",
                userName: "",
                email: "",
                role: "",
                date: "",
                hour: "",
            },
            globalDateFilters: {
                dateDebut: "",
                dateFin: "",
            },
            filteredLogs: [],
            currentPage: 0,
            itemsPerPage: 10,
            alertMessage: "",
            alertType: "",
            selectedLog: null
        };
    }

    componentDidMount() {
        axios
            .get("http://localhost:8000/admin/logs", { withCredentials: true })
            .then((res) => {
                if (res.data && Array.isArray(res.data.data)) {
                    const allLogs = res.data.data;

                    this.setState({
                        logs: allLogs,
                        filteredLogs: allLogs,
                    });
                }
            })
            .catch(() => {
                this.setState({
                    alertMessage: "Erreur de chargement",
                    alertType: "error",
                    logs: [],
                    filteredLogs: [],
                });
            });
    }

    handlePageClick = (event) => {
        this.setState({ currentPage: event.selected });
    };

    handleViewDetails = (log) => {
        this.setState({ selectedLog: log });
    };

    handleItemsPerPageChange = (e) => {
        this.setState({
            itemsPerPage: parseInt(e.target.value, 10),
            currentPage: 0,
        });
    };

    fetchLogsByDate = () => {
        const { dateDebut, dateFin } = this.state.globalDateFilters;

        if (dateDebut && dateFin) {
            axios
                .get("http://localhost:8000/admin/logs/FiltrerParDate", {
                    params: { dateDebut, dateFin },
                    withCredentials: true,
                })
                .then((res) => {
                    this.setState({
                        logs: res.data.data,
                        filteredLogs: res.data.data,
                        currentPage: 0,
                    });
                })
                .catch(() => {
                    this.setState({
                        alertMessage: "Erreur lors du filtrage par date",
                        alertType: "error",
                    });
                });
        }
    };

    handleFilterChange = (e, key) => {
        const { filters, logs } = this.state;
        const value = e.target.value.toLowerCase();

        const newFilters = { ...filters, [key]: value };

        this.setState({ filters: newFilters }, () => {
            let results = [...logs];

            Object.keys(newFilters).forEach((field) => {
                if (!newFilters[field]) return;

                if (field === "date") {
                    results = results.filter((log) => {
                        const logDate = new Date(log.createdAt)
                            .toLocaleDateString("fr-CA");

                        return logDate === newFilters.date;
                    });
                } else if (field === "userName") {
                    results = results.filter((log) =>
                        (log.user?.name || "")
                            .toLowerCase()
                            .includes(newFilters[field])
                    );
                } else if (field === "email") {
                    results = results.filter((log) =>
                        (log.user?.email || "")
                            .toLowerCase()
                            .includes(newFilters[field])
                    );
                } else if (field === "role") {
                    results = results.filter((log) =>
                        (log.user?.role || "")
                            .toLowerCase()
                            .includes(newFilters[field])
                    );

                } else if (field === "hour") {
                    results = results.filter((log) => {
                        const time = new Date(log.createdAt)
                            .toLocaleTimeString("fr-FR");
                        return time.includes(newFilters[field]);
                    });
                } else {
                    results = results.filter((log) =>
                        (log[field] || "")
                            .toString()
                            .toLowerCase()
                            .includes(newFilters[field])
                    );
                }
            });

            this.setState({
                filteredLogs: results,
                currentPage: 0,
            });
        });
    };

    closeDetails = () => {
        this.setState({ selectedLog: null });
    };

    render() {
        const { filteredLogs, filters, currentPage, itemsPerPage } = this.state;

        const startIndex = currentPage * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const currentItems = filteredLogs.slice(startIndex, endIndex);
        const pageCount = Math.ceil(filteredLogs.length / itemsPerPage);

        return (
            <section className="appointments-section">

                {/* HEADER IDENTIQUE */}
                <div
                    className="table-header"
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "10px",
                    }}
                >
                    <h2 className="title">Journal d’activité</h2>

                    {/* FILTRE DATE IDENTIQUE */}
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            this.fetchLogsByDate();
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
                                value={this.state.globalDateFilters.dateFin || ""}
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

                        <button className="add-stock-btn">Filtrer</button>
                    </form>
                </div>

                <div className="table-wrapper">

                    {/* PAGINATION CONTROL IDENTIQUE */}
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
                                <th>Email</th>
                                <th>Rôle</th>
                                <th>Action</th>
                                <th>Date</th>
                                <th>Heure</th> {/* nouvelle colonne */}
                                <th>Actions</th>
                            </tr>

                            <tr>
                                <th>
                                    <input
                                        type="text"
                                        placeholder="Nom"
                                        value={filters.userName}
                                        onChange={(e) =>
                                            this.handleFilterChange(e, "userName")
                                        }
                                        className="filter-input"
                                    />
                                </th>

                                <th>
                                    <input
                                        type="text"
                                        placeholder="Email"
                                        value={filters.email}
                                        onChange={(e) =>
                                            this.handleFilterChange(e, "email")
                                        }
                                        className="filter-input"
                                    />
                                </th>

                                <th>
                                    <input
                                        type="text"
                                        placeholder="Rôle"
                                        value={filters.role}
                                        onChange={(e) =>
                                            this.handleFilterChange(e, "role")
                                        }
                                        className="filter-input"
                                    />
                                </th>

                                <th>
                                    <input
                                        type="text"
                                        placeholder="Action"
                                        value={filters.action}
                                        onChange={(e) =>
                                            this.handleFilterChange(e, "action")
                                        }
                                        className="filter-input"
                                    />
                                </th>

                                <th>
                                    <input
                                        type="date"
                                        value={filters.date}
                                        onChange={(e) => this.handleFilterChange(e, "date")}
                                        className="filter-input"
                                    />
                                </th>

                                <th>
                                    <input
                                        type="text"
                                        placeholder="Heure"
                                        value={filters.hour || ""}
                                        onChange={(e) => this.handleFilterChange(e, "hour")}
                                        className="filter-input"
                                    />
                                </th>
                                <th></th>
                            </tr>
                        </thead>

                        <tbody>
                            {currentItems.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="no-data">
                                        Aucune donnée
                                    </td>
                                </tr>
                            ) : (
                                currentItems.map((log) => (
                                    <tr key={log._id}>
                                        <td>{log.user?.name}</td>
                                        <td>{log.user?.email}</td>
                                        <td>{log.user?.role}</td>
                                        <td>{log.action}</td>
                                        {/* DATE */}
                                        <td>
                                            {log.createdAt
                                                ? new Date(log.createdAt).toLocaleDateString("fr-CA")
                                                : ""}
                                        </td>

                                        {/* HEURE */}
                                        <td>
                                            {log.createdAt
                                                ? new Date(log.createdAt).toLocaleTimeString("fr-FR")
                                                : ""}
                                        </td>
                                        <td>
                                            <div className="actions-container">
                                                <button
                                                    className="action-btn view-btn"
                                                    title="Voir détails"
                                                    onClick={() => this.handleViewDetails(log)}
                                                >
                                                    <FiEye size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    {/* TOTAL IDENTIQUE */}
                    <div style={{ marginTop: "10px", fontWeight: "bold" }}>
                        Total : {filteredLogs.length}
                    </div>

                    {/* PAGINATION IDENTIQUE */}
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

                {/* ALERT IDENTIQUE */}
                {this.state.alertMessage && (
                    <div className={`alert-msg ${this.state.alertType}`}>
                        <div className="alert-msg-content">
                            <span>{this.state.alertMessage}</span>
                            <button
                                className="alert-ok-btn"
                                style={{ marginLeft: "10px" }}
                                onClick={() =>
                                    this.setState({ alertMessage: "", alertType: "" })
                                }
                            >
                                OK
                            </button>
                        </div>
                    </div>
                )}

                {this.state.selectedLog && (
                    <LogDetailsModal
                        log={this.state.selectedLog}
                        onClose={this.closeDetails}
                    />
                )}
            </section>
        );
    }
}

export default LogsActivite;