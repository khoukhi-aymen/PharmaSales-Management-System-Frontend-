import React, { Component } from "react";
import ReactPaginate from "react-paginate";
import PdfViewerModal from "../../components/PdfViewerModal";
import AddVenteModal from "../../components/AddVenteModal";
import ModifyVenteModal from "../../components/ModifyVenteModal";
import axios from "axios";
import { FiEdit, FiTrash2,FiFileText} from "react-icons/fi";

class CommandeClients extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ventes: [],
      filteredVentes: [],

      filters: {
        numeroVente: "",
        clientNom: "",
        dateVente: "",
        etat: "",
        tva: "",
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
      itemToUpdate: null  
    };

  }

  componentDidMount() {
    axios
      .get("http://localhost:8000/admin/Ventes", { withCredentials: true })
      .then((res) => {
        if (res.data && Array.isArray(res.data.data)) {
          this.setState({
            ventes: res.data.data,
            filteredVentes: res.data.data,
          });
        }
      })
      .catch(() => {
        this.setState({ ventes: [], filteredVentes: [] });
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

  fetchVentesByDate = () => {
    const { dateDebut, dateFin } = this.state.globalDateFilters;

    if (dateDebut && dateFin) {
      axios
        .get("http://localhost:8000/admin/Ventes/FiltrerParDate", {
          params: { dateDebut, dateFin },
          withCredentials: true,
        })
        .then((res) => {
          if (Array.isArray(res.data.data)) {
            this.setState({
              filteredVentes: res.data.data,
              currentPage: 0,
            });
          }
        })
        .catch(() => {
          this.setState({
            alertMessage: "Erreur filtrage par date",
            alertType: "error",
          });
        });
    }
  };

  handleFilterChange = (e, key) => {
    const { filters, ventes, filteredVentes, globalDateFilters } = this.state;
    const value = e.target.value;

    const newFilters = { ...filters, [key]: value };

    this.setState({ filters: newFilters }, () => {
      let results =
        globalDateFilters.dateDebut || globalDateFilters.dateFin
          ? [...filteredVentes]
          : [...ventes];

      Object.keys(newFilters).forEach((field) => {
        if (!newFilters[field]) return;

        if (field === "dateVente") {
          results = results.filter((item) => {
            const d = new Date(item.dateVente).toISOString().split("T")[0];
            return d === newFilters[field];
          });
        } else if (field === "tva") {
          results = results.filter(
            (item) =>
              item.tva !== undefined &&
              item.tva.toString().includes(newFilters[field])
          );
        } else {
          results = results.filter((item) =>
            item[field]
              ?.toString()
              .toLowerCase()
              .includes(newFilters[field].toLowerCase())
          );
        }
      });

      this.setState({ filteredVentes: results, currentPage: 0 });
    });
  };

  handleConfirmDelete = () => {
    const { itemToDelete } = this.state;

    axios
      .delete(`http://localhost:8000/admin/Ventes/Supprimer/${itemToDelete._id}`, { withCredentials: true })
      .then((res) => {
        this.setState((prev) => ({
          ventes: prev.ventes.filter((v) => v._id !== itemToDelete._id),
          filteredVentes: prev.filteredVentes.filter((v) => v._id !== itemToDelete._id),
          showDeleteAlert: false,
          alertMessage: res.data.message || "Commande Client supprimée avec succès",
          alertType: "success",
          itemToDelete: null,
        }));
      })
      .catch((err) => {
        this.setState({
          showDeleteAlert: false,
          alertMessage: err.response?.data?.message || "Erreur lors de la suppression",
          alertType: "error",
          itemToDelete: null,
        });
      });
  };

  updateVenteInState = (updatedVente) => {
    this.setState((prevState) => ({
      ventes: prevState.ventes.map((v) =>
        v._id === updatedVente._id ? { ...v, ...updatedVente } : v
      ),
      filteredVentes: prevState.filteredVentes.map((v) =>
        v._id === updatedVente._id ? { ...v, ...updatedVente } : v
      )
    }));
  };

  handleViewPdf = (item) => {
    if (item.etat !== "livrée" && item.etat !== "facturée") {
      this.setState({
        alertMessage: "PDF autorisé uniquement pour les commandes livrées et facturées",
        alertType: "error"
      });
      return;
    }

    // Si OK → afficher le PDF
    this.setState({
      showPdfModal: true,
      pdfToShow: `http://localhost:8000/admin/Ventes/pdf/${item._id}`
    });
  };




  render() {
    const { filteredVentes, filters, currentPage, itemsPerPage } = this.state;

    const startIndex = currentPage * itemsPerPage;
    const currentItems = filteredVentes.slice(
      startIndex,
      startIndex + itemsPerPage
    );
    const pageCount = Math.ceil(filteredVentes.length / itemsPerPage);

    return (
      <section className="appointments-section">
        <div className="table-header"
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>

          <h2 className="title">Liste de Commandes Clients</h2>

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
                  }, this.fetchVentesByDate)
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
                  }, this.fetchVentesByDate)
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
                <th>Client</th>
                <th>État</th>
                <th>TVA</th>
                <th>Actions</th>
              </tr>
              <tr>
                <th>
                  <input
                    type="text"
                    placeholder="Rechercher numéro"
                    value={filters.numeroVente}
                    onChange={(e) => this.handleFilterChange(e, "numeroVente")}
                    className="search-input"
                  />
                </th>
                <th>
                  <input
                    type="date"
                    value={filters.dateVente}
                    onChange={(e) => this.handleFilterChange(e, "dateVente")}
                    className="search-input"
                  />
                </th>
                <th>
                  <input
                    type="text"
                    placeholder="Rechercher Client"
                    value={filters.clientNom}
                    onChange={(e) => this.handleFilterChange(e, "clientNom")}
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
                    type="number"
                    placeholder="Rechercher TVA"
                    value={filters.tva}
                    onChange={(e) => this.handleFilterChange(e, "tva")}
                    className="search-input"
                    min="0"
                  />
                </th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-data">
                    Aucune commande trouvée.
                  </td>
                </tr>
              ) : (
                currentItems.map((item) => (
                  <tr key={item._id}>
                    <td>{item.numeroVente}</td>
                    <td>{new Date(item.dateVente).toISOString().split("T")[0]}</td>
                    <td>{item.clientNom}</td>
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
                            : item.etat === "livrée"
                              ? "linear-gradient(135deg, #3b82f6, #2563eb)" // bleu dégradé
                              : item.etat === "facturée"
                                ? "linear-gradient(135deg, #8b5cf6, #a78bfa)" // violet dégradé
                                : "#e0e0e0", // gris par défaut
                        boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                        transition: "all 0.3s ease",
                        minWidth: "90px"
                      }}
                    >
                      {item.etat || "Brouillon"}
                    </td>
                    <td>{item.tva}%</td>
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
          Total : {this.state.filteredVentes.length}
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
            onClose={() =>
              this.setState({ showPdfModal: false, pdfToShow: "" })
            }
          />
        )}

        {/* Modale pour ajouter une Vente */}

        {this.state.showCommandeModal && (
          <AddVenteModal
            onClose={() => this.setState({ showCommandeModal: false })}
            onRefresh={() => this.componentDidMount()}
          />
        )}

       {/* Modale pour Modifier une Vente */}

        {this.state.showUpdateModal && this.state.itemToUpdate && (
          <ModifyVenteModal
            vente={this.state.itemToUpdate}
            onClose={() => this.setState({ showUpdateModal: false, itemToUpdate: null })}
            onUpdateVente={this.updateVenteInState}
          />
        )}


        {/* Message de confirmation de suppression */}

        {this.state.showDeleteAlert && this.state.itemToDelete && (
          <div className="delete-alert">
            <div className="delete-alert-content">
              <span>Voulez-vous vraiment supprimer la Commande "{this.state.itemToDelete.numeroVente}" ?</span>
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

export default CommandeClients;
