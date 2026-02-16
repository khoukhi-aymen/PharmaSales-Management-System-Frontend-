import React, { Component } from "react";
import ReactPaginate from "react-paginate";
import PdfViewerModal from "../../components/PdfViewerModal";
import AddAchatModal from "../../components/AddAchatModal";
import ModifyAchatModal from "../../components/ModifyAchatModal";
import axios from "axios";
import { FiEdit, FiTrash2, FiFileText } from "react-icons/fi";

class CommandeFournisseurs extends Component {
  constructor(props) {
    super(props);
    this.state = {
      achats: [],
      filteredAchats: [],

      filters: {
        numeroAchat: "",
        fournisseurNom: "",
        dateCommande: "",
        etat: "",
        modePaiement: ""
      },

      globalDateFilters: {
        dateDebut: "",
        dateFin: "",
      },

      currentPage: 0,
      itemsPerPage: 10,

      itemToDelete: null,
      showDeleteAlert: false,

      alertMessage: "",
      alertType: "",

      showPdfModal: false,
      pdfToShow: "",

      showCommandeModal: false,
      showUpdateModal: false,
      itemToUpdate: null,
    };
  }

  componentDidMount() {
    axios
      .get("http://localhost:8000/admin/Achats", { withCredentials: true })
      .then((res) => {
        if (Array.isArray(res.data.data)) {
          this.setState({
            achats: res.data.data,
            filteredAchats: res.data.data,
          });
        }
      })
      .catch(() => {
        this.setState({ achats: [], filteredAchats: [] });
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

  fetchAchatsByDate = () => {
    const { dateDebut, dateFin } = this.state.globalDateFilters;

    if (dateDebut && dateFin) {
      axios
        .get("http://localhost:8000/admin/Achats/FiltrerParDate", {
          params: { dateDebut, dateFin },
          withCredentials: true,
        })
        .then((res) => {
          console.log(res.data)
          if (Array.isArray(res.data.data)) {
            this.setState({
              filteredAchats: res.data.data,
              currentPage: 0,
            });
          }
        });
    }
  };

  handleFilterChange = (e, key) => {
    const value = e.target.value;
    const newFilters = { ...this.state.filters, [key]: value };

    this.setState({ filters: newFilters }, () => {
      let results = [...this.state.achats];

      Object.keys(newFilters).forEach((field) => {
        if (!newFilters[field]) return;

        if (field === "dateCommande") {
          results = results.filter(
            (a) =>
              new Date(a.dateCommande).toISOString().split("T")[0] ===
              newFilters[field]
          );
        } else {
          results = results.filter((a) =>
            a[field]?.toLowerCase().includes(newFilters[field].toLowerCase())
          );
        }
      });

      this.setState({ filteredAchats: results, currentPage: 0 });
    });
  };

  handleConfirmDelete = () => {
    const { itemToDelete } = this.state;

    axios
      .delete(
        `http://localhost:8000/admin/Achats/Supprimer/${itemToDelete._id}`,
        { withCredentials: true }
      )
      .then((res) => {
        this.setState((prev) => ({
          achats: prev.achats.filter((a) => a._id !== itemToDelete._id),
          filteredAchats: prev.filteredAchats.filter(
            (a) => a._id !== itemToDelete._id
          ),
          showDeleteAlert: false,
          alertMessage: res.data.message || "Bon de commande supprimé",
          alertType: "success",
          itemToDelete: null,
        }));
      })
      .catch((err) => {
        this.setState({
          showDeleteAlert: false,
          alertMessage:
            err.response?.data?.message || "Erreur lors de la suppression",
          alertType: "error",
          itemToDelete: null,
        });
      });
  };

  updateAchatInState = (updatedAchat) => {
    this.setState((prev) => ({
      achats: prev.achats.map((a) =>
        a._id === updatedAchat._id ? updatedAchat : a
      ),
      filteredAchats: prev.filteredAchats.map((a) =>
        a._id === updatedAchat._id ? updatedAchat : a
      ),
    }));
  };

  handleViewPdf = (item) => {
    this.setState({
      showPdfModal: true,
      pdfToShow: `http://localhost:8000/admin/Achats/pdf/${item._id}`,
    });
  };

  render() {
    const { filteredAchats, filters, currentPage, itemsPerPage } = this.state;

    const startIndex = currentPage * itemsPerPage;
    const currentItems = filteredAchats.slice(
      startIndex,
      startIndex + itemsPerPage
    );
    const pageCount = Math.ceil(filteredAchats.length / itemsPerPage);

    return (
      <section className="appointments-section">
        <div className="table-header"
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>

          <h2 className="title">Liste Achats Fournisseurs</h2>

          {/* Filtres de dates */}
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <div>
              <label>Du :</label>
              <input
                type="date"
                className="date-input"
                value={this.state.globalDateFilters.dateDebut || ""}
                onChange={(e) =>
                  this.setState({
                    globalDateFilters: { ...this.state.globalDateFilters, dateDebut: e.target.value }
                  }, this.fetchAchatsByDate)
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
                    globalDateFilters: { ...this.state.globalDateFilters, dateFin: e.target.value }
                  }, this.fetchAchatsByDate)
                }
              />
            </div>
          </div>


          <button
            onClick={() => this.setState({ showCommandeModal: true })}
            className="add-stock-btn"
          >
            + Ajouter
          </button>

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
              <th>Numéro</th>
              <th>Date</th>
              <th>Fournisseur</th>
              <th>État</th>
              <th>Mode de paiement</th>
              <th>Actions</th>
            </tr>
            <tr>
                <th>
                  <input
                    type="text"
                    placeholder="Rechercher numéro"
                    value={filters.numeroAchat}
                    onChange={(e) => this.handleFilterChange(e, "numeroAchat")}
                    className="search-input"
                  />
                </th>
                <th>
                  <input
                    type="date"
                    value={filters.dateCommande}
                    onChange={(e) => this.handleFilterChange(e, "dateCommande")}
                    className="search-input"
                  />
                </th>
                <th>
                  <input
                    type="text"
                    placeholder="Rechercher Fournisseur"
                    value={filters.fournisseurNom}
                    onChange={(e) => this.handleFilterChange(e, "fournisseurNom")}
                    className="search-input"
                  />
                </th>
                <th>
                  <input
                    type="text"
                    placeholder="Rechercher etat"
                    value={filters.etat}
                    onChange={(e) => this.handleFilterChange(e, "etat")}
                    className="search-input"
                  />
                </th>
                <th>
                  <input
                    type="text"
                    placeholder="Rechercher Mode Paiement"
                    value={filters.modePaiement} // <-- filtre ajouté
                    onChange={(e) =>
                      this.handleFilterChange(e, "modePaiement")
                    }
                    className="search-input"
                  />
                </th>
                <th></th>
              </tr>
          </thead>

          <tbody>
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-data">
                    Aucune Achats trouvée.
                  </td>
                </tr>
              ) : (
                currentItems.map((item) => (
                  <tr key={item._id}>
                    <td>{item.numeroAchat}</td>
                    <td>
                      {new Date(item.dateCommande).toISOString().split("T")[0]}
                    </td>
                    <td>{item.fournisseurNom}</td>
                    <td
                      style={{
                        fontWeight: "600",
                        textAlign: "center",
                        padding: "8px 12px",
                        borderRadius: "12px",
                        color: "#fff",
                        background: item.etat === "validée"
                          ? "linear-gradient(135deg, #34d399, #10b981)" // vert dégradé
                          : item.etat === "brouillon"
                            ? "linear-gradient(135deg, #fbbf24, #f59e0b)" // orange dégradé
                            : "#e0e0e0", // gris par défaut
                        boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                        transition: "all 0.3s ease",
                        minWidth: "90px"
                      }}
                    >
                      {item.etat || "Brouillon"}
                    </td>
                    <td>{item.modePaiement || "-"}</td>
                    <td>
                      <div className="actions-container" style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
                        {/* Visualiser PDF */}
                        <button
                          className="action-btn view-btn"
                          onClick={() => this.handleViewPdf(item)}
                          title="Visualiser PDF"
                        >
                          <FiFileText size={18} />
                        </button>

                        {/* Modifier */}
                        <button
                          className="action-btn update-btn"
                          onClick={() =>
                            this.setState({ showUpdateModal: true, itemToUpdate: item })
                          }
                          title="Modifier"
                        >
                          <FiEdit size={18} />
                        </button>


                        {/* Supprimer */}
                        <button
                          className="action-btn delete-btn"
                          onClick={() =>
                            this.setState({ showDeleteAlert: true, itemToDelete: item })
                          }
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
        </div>

        {/* Nombre total d'éléments */}
        <div style={{ marginTop: "10px", fontWeight: "bold" }}>
          Total : {this.state.filteredAchats.length}
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

        {/* Modale pour afficher le PDF */}
        {this.state.showPdfModal && (
          <PdfViewerModal
            pdfUrl={this.state.pdfToShow}
            onClose={() => this.setState({ showPdfModal: false })}
          />
        )}

        {/* Modale pour ajouter une Vente */}
        {this.state.showCommandeModal && (
          <AddAchatModal
            onClose={() => this.setState({ showCommandeModal: false })}
            onRefresh={() => this.componentDidMount()}
          />
        )}

        {/* Modale pour Modifier une Vente */}
        {this.state.showUpdateModal && (
          <ModifyAchatModal
            achat={this.state.itemToUpdate}
            onClose={() => this.setState({ showUpdateModal: false })}
            onUpdateAchat={this.updateAchatInState}
          />
        )}
        {/* Message de confirmation de suppression */}

        {this.state.showDeleteAlert && this.state.itemToDelete && (
          <div className="delete-alert">
            <div className="delete-alert-content">
              <span>Voulez-vous vraiment supprimer la Commande "{this.state.itemToDelete.numeroAchat}" ?</span>
              <div className="delete-alert-actions">
                <button className="delete-yes-btn" onClick={this.handleConfirmDelete}>
                  Oui
                </button>
                <button
                  className="delete-no-btn"
                  onClick={() =>
                    this.setState({ showDeleteAlert: false, itemToDelete: null })
                  }
                >
                  Non
                </button>
              </div>
            </div>
          </div>
        )}


        {/* Message OK après succès / erreur */}

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

export default CommandeFournisseurs;
