import React, { Component } from "react";
import ReactPaginate from "react-paginate";
import ProformaModal from "../../components/AddProformaModel";
import ModifyProformaModal from "../../components/ModifyProformaModal";
import PdfViewerModal from "../../components/PdfViewerModal";
import axios from "axios";
import { FiEdit, FiTrash2,FiFileText} from "react-icons/fi";



class Proformats extends Component {
  constructor(props) {
    super(props);
    this.state = {
      proformas: [],            // liste des factures proforma
      filters: {
        numeroFacture: "",
        clientNom: "",
        dateFacture: "",
        totalHT: "",
        totalTTC: "",
        tva: "",
      },
      globalDateFilters: {     // filtre par plage de dates
        dateDebut: "",
        dateFin: "",
      },
      filteredProformas: [],   // après filtrage
      currentPage: 0,
      itemsPerPage: 10,

      showProformaModal: false,
      showModifyModal: false,
      itemToModify: null,

      itemToDelete: null,
      showDeleteAlert: false,
      alertMessage: "",
      alertType: "",

      showPdfModal: false,
      pdfToShow: "", // URL du PDF à afficher
      
      selectedProformaToValidate: null, //pour savoir quelle proforma est validée

      showValidateAlert: false,
      itemToValidate: null,


      showRevertAlert: false, 
      itemToRevert: null, 
    };

  }

  componentDidMount() {
    axios
      .get("http://localhost:8000/admin/Proformas", { withCredentials: true })
      .then((res) => {
        if (res.data.redirectUrl) {
          window.location.href = res.data.redirectUrl;
          return;
        }

        if (res.data && Array.isArray(res.data.data)) {
          this.setState({
            proformas: res.data.data,
            filteredProformas: res.data.data,
          });
        } else {
          this.setState({ proformas: [], filteredProformas: [] });
        }
      })
      .catch((err) => {
        console.error("Erreur fetch proformas:", err);
        this.setState({ proformas: [], filteredProformas: [] });
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

  handleOpenProformatModal = () => {
    this.setState({ showProformaModal: true });
  };

  handleCloseProformatModal = () => {
    this.setState({ showProformaModal: false });
  };


  handleDeleteClick = (item) => {
    this.setState({ itemToDelete: item, showDeleteAlert: true });
  };




  handleConfirmDelete = () => {
    const { itemToDelete } = this.state;

    axios
      .delete(`http://localhost:8000/admin/Proforma/Supprimer/${itemToDelete._id}`, { withCredentials: true })
      .then((res) => {
        // Supprimer l’élément de la liste affichée côté front
        this.setState((prevState) => ({
          proformas: prevState.proformas.filter((i) => i._id !== itemToDelete._id),
          filteredProformas: prevState.filteredProformas.filter((i) => i._id !== itemToDelete._id),
          showDeleteAlert: false,
          alertMessage: res.data.message || `La proforma "${itemToDelete.numeroFacture}" a été supprimée avec succès`,
          alertType: "success",
          itemToDelete: null,
        }));

      })
      .catch((err) => {
        this.setState({
          showDeleteAlert: false,
          alertMessage: err.response?.data?.message || `Erreur lors de la suppression de la proforma "${itemToDelete.numeroFacture}"`,
          alertType: "error",
          itemToDelete: null,
        });
      });
  };




  refreshProformas = () => {
    axios
      .get("http://localhost:8000/admin/Proformas", { withCredentials: true })
      .then((res) => {
        if (res.data && Array.isArray(res.data.data)) {
          this.setState({
            proformas: res.data.data,
            filteredProformas: res.data.data,
          });
        }
      })
      .catch((err) => console.error("Erreur de rafraîchissement :", err));
  };

  updateProformaInState = (updatedItem) => {
    this.setState((prevState) => ({
      proformas: prevState.proformas.map((p) =>
        p._id === updatedItem._id ? { ...p, ...updatedItem } : p
      ),
      filteredProformas: prevState.filteredProformas.map((p) =>
        p._id === updatedItem._id ? { ...p, ...updatedItem } : p
      )
    }));
  };



  fetchProformasByDate = () => {
    const { dateDebut, dateFin } = this.state.globalDateFilters;

    if (dateDebut && dateFin) {
      axios
        .get(`http://localhost:8000/admin/Proformats/FiltrerParDate`, {
          params: { dateDebut, dateFin },
          withCredentials: true,
        })
        .then((res) => {
          console.log(res)
          if (res.data && Array.isArray(res.data.data)) {
            this.setState({
              filteredProformas: res.data.data,
              currentPage: 0,
            });
          }
        })
        .catch((err) => {
          const message = "Erreur lors du filtrage par date";
          this.setState({ alertMessage: message, alertType: "error" });
        });
    }
  };


  handleFilterChange = (e, key) => {// error ici dans le filtarge par date dans le tableau !!!!!!!!!
    const { filters, proformas, filteredProformas, globalDateFilters } = this.state;
    const value = e.target.value;

    const newFilters = { ...filters, [key]: value };

    this.setState({ filters: newFilters }, () => {
      let results =
        globalDateFilters.dateDebut || globalDateFilters.dateFin
          ? [...filteredProformas]
          : [...proformas];

      Object.keys(newFilters).forEach((field) => {
        if (!newFilters[field]) return;

        // Date exacte
        if (field === "dateFacture") {
          results = results.filter(item => {
            if (!item.dateFacture) return false;
            const itemDate = new Date(item.dateFacture)
              .toISOString()
              .split("T")[0];
            return itemDate === newFilters[field];
          });
        }

        // TVA
        else if (field === "tva") {
          results = results.filter(item =>
            item.tva !== undefined &&
            item.tva !== null &&
            item.tva.toString().includes(newFilters[field])
          );
        }

        // Texte
        else {
          results = results.filter(item =>
            item[field]
              ?.toString()
              .toLowerCase()
              .includes(newFilters[field].toLowerCase())
          );
        }
      });

      this.setState({
        filteredProformas: results,
        currentPage: 0,
      });
    });
  };



  

  render() {
    const { filteredProformas, filters, currentPage, itemsPerPage, showProformaModal } = this.state;

    // Pagination
    const startIndex = currentPage * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = filteredProformas.slice(startIndex, endIndex);
    const pageCount = Math.ceil(filteredProformas.length / itemsPerPage);


    return (
      <section className="appointments-section">
        <div className="table-header"
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>

          <h2 className="title">Liste de Factures Proformats</h2>

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
                  }, this.fetchProformasByDate)
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
                  }, this.fetchProformasByDate)
                }
              />
            </div>
          </div>


          <button onClick={this.handleOpenProformatModal} className="add-stock-btn">
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
                <th>TVA (%)</th>
                <th>Actions</th>
              </tr>
              <tr>
                <th>
                  <input
                    type="text"
                    placeholder="Rechercher numéro"
                    value={filters.numeroFacture}
                    onChange={(e) => this.handleFilterChange(e, "numeroFacture")}
                    className="search-input"
                  />
                </th>
                <th>
                  <input
                    type="date"
                    value={filters.dateFacture}
                    onChange={(e) => this.handleFilterChange(e, "dateFacture")}
                    className="search-input"
                  />
                </th>
                <th>
                  <input
                    type="text"
                    placeholder="Rechercher client"
                    value={filters.clientNom}
                    onChange={(e) => this.handleFilterChange(e, "clientNom")}
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
                  <td colSpan="7" className="no-data">
                    Aucune proforma trouvée.
                  </td>
                </tr>
              ) : (
                currentItems.map((item) => (
                  <tr key={item._id}>
                    <td>{item.numeroFacture}</td>
                    <td>{new Date(item.dateFacture).toISOString().split("T")[0]}</td>
                    <td>{item.clientNom}</td>
                    <td>{item.tva || 0}%</td>
                    <td>
                      <div className="actions-container" style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
                        {/* Visualiser PDF */}
                        <button
                          className="action-btn view-btn"
                          onClick={() =>
                            this.setState({ showPdfModal: true, pdfToShow: `http://localhost:8000/admin/Proformas/pdf/${item._id}` })
                          }
                          title="Visualiser PDF"
                        >
                          <FiFileText size={18} />
                        </button>

                        {/* Modifier */}
                        <button
                          className="action-btn update-btn"
                          onClick={() =>
                            this.setState({ showModifyModal: true, itemToModify: item })
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


          {/* Nombre total d'éléments */}
          <div style={{ marginTop: "10px", fontWeight: "bold" }}>
            Total : {this.state.filteredProformas.length}
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

        {/* Modale ajouter une proforma */}
        {showProformaModal && (
          <ProformaModal
            onClose={this.handleCloseProformatModal}
            onRefresh={this.refreshProformas}

          />
        )}


        {/* Modale modifier une proforma */}

        {this.state.showModifyModal && (
          <ModifyProformaModal
            item={this.state.itemToModify}
            onClose={() => this.setState({ showModifyModal: false, itemToModify: null })}
            onUpdateProforma={this.updateProformaInState}
          />
        )}

        {/* Modale pour afficher le PDF */}

        {this.state.showPdfModal && (
          <PdfViewerModal
            pdfUrl={this.state.pdfToShow}
            onClose={() => this.setState({ showPdfModal: false, pdfToShow: "" })}
          />
        )}




        {/* Message de confirmation de suppression */}
        {this.state.showDeleteAlert && this.state.itemToDelete && (
          <div className="delete-alert">
            <div className="delete-alert-content">
              <span>Voulez-vous vraiment supprimer la proforma "{this.state.itemToDelete.numeroFacture}" ?</span>
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

export default Proformats;
