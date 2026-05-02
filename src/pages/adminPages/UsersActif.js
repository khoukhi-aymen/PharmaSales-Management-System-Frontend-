import React, { Component } from "react";
import ReactPaginate from "react-paginate";
import axios from "../../Config/axiosConfig";
import { FiToggleRight,FiEdit,FiKey  } from "react-icons/fi";
import ModifyUserModal from "../../components/ModifyUserModal";
import CreateUserModal from "../../components/CreateUserModal";
import ResetPasswordModal from "../../components/ResetPasswordModal";

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
      showCreateModal: false,
      showDeactivateAlert: false,
      userToDeactivate: null,
      showEditModal: false,
      userToEdit: null,
      showResetModal: false,
      userToReset: null,
    };
  }

  componentDidMount() {
    this.loadUsers();
  }

  // ======================
  // LOAD USERS
  // ======================

  loadUsers = () => {
    axios.get("http://localhost:8000/admin/users/actifs", {
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
        .get("http://localhost:8000/admin/users/actifs/filtrerParDate", {
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

  handleDeactivateClick = (user) => {
    this.setState({
      showDeactivateAlert: true,
      userToDeactivate: user
    });
  };

  handleConfirmDeactivate = () => {
    const { userToDeactivate } = this.state;

    axios.post(
      `http://localhost:8000/users/deactivate/${userToDeactivate._id}`,
      {},
      { withCredentials: true }
    )
      .then(res => {
        this.setState({
          alertMessage: res.data.message,
          alertType: "success",
          showDeactivateAlert: false,
          userToDeactivate: null
        });

        this.loadUsers();
      })
      .catch(() => {
        this.setState({
          alertMessage: "Erreur mise à jour",
          alertType: "error",
          showDeactivateAlert: false,
          userToDeactivate: null
        });
      });
  };

  // ======================
  // RESET PSW
  // ======================

  handleResetPassword = (id) => {
    axios
      .get(`http://localhost:8000/admin/users/${id}`, {
        withCredentials: true
      })
      .then((res) => {
        const user = res.data.data;

        this.setState({
          userToReset: {
            _id: user._id,
            name: user.name,
            email: user.email
          },
          showResetModal: true
        });
      })
      .catch(() => {
        this.setState({
          alertMessage: "Erreur chargement user",
          alertType: "error"
        });
      });
  };

  // ======================
  // MODIFIER USER
  // ======================

  handleEditClick = (id) => {

    axios
      .get(`http://localhost:8000/admin/users/${id}`, {
        withCredentials: true
      })
      .then((res) => {


        const user = res.data.data;

        this.setState({
          userToEdit: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
          },
          showEditModal: true
        });

      })
      .catch((err) => {
        this.setState({
          alertMessage: "Erreur de chargement",
          alertType: "error"
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
          <h2 className="title">Utilisateurs Actifs</h2>

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
              this.fetchUsersByDate();
            }}
            style={{ display: "flex", gap: "10px", alignItems: "center" }}
          >
            <div>
              <label>Du :</label>
              <input
                type="date"
                className="date-input"
                value={this.state.globalDateFilters.dateDebut}
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
                value={this.state.globalDateFilters.dateFin}
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
                          className="action-btn update-btn"
                          title="modifier"
                          onClick={() => this.handleEditClick(user._id)}
                        >
                          <FiEdit size={18} />
                        </button>

                        <button
                          className="action-btn deactivate-btn"
                          title="désactiver"
                          onClick={() => this.handleDeactivateClick(user)}
                        >
                          <FiToggleRight size={18} />
                        </button>

                        <button
                          className="reset-btn"
                          title="Reset psw"
                          onClick={() => this.handleResetPassword(user._id)}
                        >
                          <FiKey size={18} />
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

        {/* MODAL CREATE USER */}

        {this.state.showCreateModal && (
          <CreateUserModal
            key={Date.now()}
            onClose={() => this.setState({ showCreateModal: false })}
            onSuccess={() => this.loadUsers()} // reload depuis backend
          />
        )}

        {/* MODALE MODIFIER USER */}

       {this.state.showEditModal && this.state.userToEdit && (
          <ModifyUserModal
            user={this.state.userToEdit}
            onClose={() =>
              this.setState({
                showEditModal: false,
                userToEdit: null
              })
            }
            onUpdateUser={(updatedUser) => {
              this.setState((prev) => ({
                users: prev.users.map(u =>
                  u._id === updatedUser._id ? updatedUser : u
                ),
                filteredUsers: prev.filteredUsers.map(u =>
                  u._id === updatedUser._id ? updatedUser : u
                ),
                userToEdit: updatedUser // on garde le modal ouvert
              }));
            }}
          />
        )}

        {/* ALERTE DÉSACTIVATION */}
        {this.state.showDeactivateAlert && this.state.userToDeactivate && (
          <div className="deactivate-alert">
            <div className="deactivate-alert-content">

              <span>
                Voulez-vous vraiment désactiver l'utilisateur "
                {this.state.userToDeactivate.name}" ?
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
                      userToDeactivate: null
                    })
                  }
                >
                  Non
                </button>

              </div>
            </div>
          </div>
        )}

        {/* MODALE RESET PSW */}

        {this.state.showResetModal && this.state.userToReset && (
          <ResetPasswordModal
            user={this.state.userToReset}
            onClose={() =>
              this.setState({
                showResetModal: false,
                userToReset: null
              })
            }
            onSuccess={() => this.loadUsers()}
          />
)}

        

        

      </section>
    );
  }
}

export default Users;