import React, { Component } from "react";
import Fuse from "fuse.js";
import ReactPaginate from "react-paginate";
import StockModal from "../../components/AddStockModel";
import ModifyStockModal from "../../components/ModifyStockModal";
import axios from "axios";
import { FiEdit, FiTrash2 } from "react-icons/fi";



class Stock extends Component {
  constructor(props) {
    super(props);
    this.state = {
      stock: [],
      filters: {
        produit: "",
        prixUnitaire: "",
        quantite: "",
        dateEntree: "",
        dateExpiration: "",
        fournisseur: "",
      },
      globalDateFilters: {   // <-- filtres DatePicker en haut
        dateDebut: "",
        dateFin: "",
      },
      filteredstock: [],
      currentPage: 0,
      itemsPerPage: 10,
      showStockModal: false, //  nouvel état pour afficher la modale
      itemToDelete: null, // l'item à supprimer
      showDeleteAlert: false, // pour afficher le message de confirmation
      showModifyModal: false,
      itemToModify: null,
    };
  }

  componentDidMount() {
    axios
      .get("http://localhost:8000/admin/Stock", { withCredentials: true })
      .then((res) => {
        // redirection si non connecté
        if (res.data.redirectUrl) {
          window.location.href = res.data.redirectUrl;
          return;
        }

        // vérifier que les données existent
        if (res.data && Array.isArray(res.data.data)) {
          this.setState({
            stock: res.data.data,
            filteredstock: res.data.data,
          });
        } else {
          this.setState({ stock: [], filteredstock: [] });
        }
      })
      .catch((err) => {
        console.error("Erreur fetch stock:", err);
        this.setState({ stock: [], filteredstock: [] });
      });
  };


  handlePageClick = (event) => {
    this.setState({ currentPage: event.selected });
  };

  handleItemsPerPageChange = (e) => {
    this.setState({
      itemsPerPage: parseInt(e.target.value, 10),
      currentPage: 0,
    });
  };

  handleOpenStockModal = () => {
    this.setState({ showStockModal: true });
  };

  handleCloseStockModal = () => {
    this.setState({ showStockModal: false });
  };

  handleDeleteClick = (item) => {
    this.setState({ itemToDelete: item, showDeleteAlert: true });
  };


  handleConfirmDelete = () => {
    const { itemToDelete } = this.state;
    axios
      .delete(`http://localhost:8000/admin/Stock/SupprimerProduit/${itemToDelete._id}`, { withCredentials: true })
      .then((res) => {
        this.setState((prevState) => ({
          stock: prevState.stock.filter((i) => i._id !== itemToDelete._id),
          filteredstock: prevState.filteredstock.filter((i) => i._id !== itemToDelete._id),
          showDeleteAlert: false,
          alertMessage: res.data.message || `Le produit "${itemToDelete.produit}" a été supprimé avec succès`,
          alertType: "success",
          itemToDelete: null,
        }));
      })
      .catch((err) => {
        this.setState({
          showDeleteAlert: false,
          alertMessage: err.response?.data?.message || `Erreur lors de la suppression du produit "${itemToDelete.produit}"`,
          alertType: "error",
          itemToDelete: null,
        });
      });
  };

  refreshStock = () => {
    axios
      .get("http://localhost:8000/admin/Stock", { withCredentials: true })
      .then((res) => {
        if (res.data && Array.isArray(res.data.data)) {
          this.setState({
            stock: res.data.data,
            filteredstock: res.data.data,
          });
        }
      })
      .catch((err) => console.error("Erreur RAFRAICHISSEMENT :", err));
  };

  fetchStockByDate = () => {
    const { dateDebut, dateFin } = this.state.globalDateFilters;

    if (dateDebut && dateFin) {
      axios
        .get(`http://localhost:8000/admin/Stock/FiltrerParDate`, {
          params: { dateDebut, dateFin },
          withCredentials: true,
        })
        .then((res) => {
          if (res.data && Array.isArray(res.data.data)) {
            this.setState({
              filteredstock: res.data.data,
              currentPage: 0,
            });
          }
        })
        .catch((err) => {
          // Si l'erreur contient un message du back-end, utilise-le, sinon message générique
          const message = "Erreur lors du filtrage par date d'entrée";

          this.setState({
            alertMessage: message,
            alertType: "error",
          });
        });
    }
  };

  updateStockInState = (updatedItem) => {
    this.setState((prevState) => ({
      stock: prevState.stock.map((p) =>
        p._id === updatedItem._id ? { ...p, ...updatedItem } : p
      ),
      filteredstock: prevState.filteredstock.map((p) =>
        p._id === updatedItem._id ? { ...p, ...updatedItem } : p
      )
    }));
  };




  handleFilterChange = (e, key) => { // error ici dans le filtarge par date dans le tableau !!!!!!!!!
    const { filters, stock, filteredstock, globalDateFilters } = this.state;

    const value = e.target.value;
    const newFilters = { ...filters, [key]: value };

    this.setState({ filters: newFilters }, () => {

      // Ancienne condition toujours vraie → bug
      // Nouvelle condition correcte : on ignore seulement les filtres globaux
      if (key === "dateDebut" || key === "dateFin") return;

      // Point de départ du filtrage
      let results = (globalDateFilters.dateDebut && globalDateFilters.dateFin)
        ? filteredstock
        : stock;

      // Appliquer les filtres colonne par colonne
      Object.keys(newFilters).forEach((field) => {

        // pas de filtre => ignorer
        if (!newFilters[field] || newFilters[field].trim() === "") return;

        // filtrage des dates dans les colonnes du tableau
        if (field === "dateEntree" || field === "dateExpiration") {
          //error dans cette partie !!!!!!!
          console.log(field)

          results = results.filter(item => {
            const itemDate = new Date(item[field]).toISOString().split("T")[0];
            console.log(itemDate)
            console.log(newFilters[field])
            return itemDate === newFilters[field];
          });

        } else {

          // Filtrage texte avec Fuse.js
          const fuse = new Fuse(results, {
            keys: ["produit", "quantite", "prixUnitaire", "fournisseur"],
            threshold: 0.3
          });
          results = fuse.search(newFilters[field]).map(r => r.item);
        }
      });

      this.setState({ filteredstock: results, currentPage: 0 });
    });
  };

  









  render() {
    const { filteredstock, filters, currentPage, itemsPerPage, showStockModal } = this.state;

    // Pagination logic
    const startIndex = currentPage * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = filteredstock.slice(startIndex, endIndex);
    const pageCount = Math.ceil(filteredstock.length / itemsPerPage);

    return (
      <section className="appointments-section">
        <div className="table-header"
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>

          <h2 className="title">Liste du stock</h2>

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
                  }, this.fetchStockByDate)
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
                  }, this.fetchStockByDate)
                }
              />
            </div>
          </div>


          <button onClick={this.handleOpenStockModal} className="add-stock-btn">
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
                <th>produit</th>
                <th>prix unitaire</th>
                <th>quantite</th>
                <th>date-Entree</th>
                <th>date-Expiration</th>
                <th>fournisseur</th>
                <th>Actions</th>
              </tr>
              <tr>
                {Object.keys(filters).map((key) => (
                  <th key={key}>
                    {key === "dateEntree" || key === "dateExpiration" ? (
                      <input
                        type="date"
                        value={filters[key]}
                        onChange={(e) => this.handleFilterChange(e, key)}
                        className="filter-input"
                        style={{ width: "150px" }}
                      />
                    ) : (
                      <input
                        type="text"
                        placeholder={`Rechercher ${key}`}
                        value={filters[key]}
                        onChange={(e) => this.handleFilterChange(e, key)}
                        className="filter-input"
                        style={{ width: "150px" }}
                      />
                    )}
                  </th>
                ))}
                <th></th>
              </tr>
            </thead>

            <tbody>
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan="7" className="no-data">
                    Aucun produit trouvé.
                  </td>
                </tr>
              ) : (
                currentItems.map((item) => (
                  <tr
                    key={item._id}
                    className={item.quantite == 0 ? "stock-zero" : ""}
                  >

                    <td>{item.produit}</td>
                    <td>{item.prixUnitaire} DA</td>
                    <td>{item.quantite}</td>
                    <td>{new Date(item.dateEntree).toISOString().split("T")[0]}</td>
                    <td>{new Date(item.dateExpiration).toISOString().split("T")[0]}</td>
                    <td>{item.fournisseur}</td>
                    {/* ---- COLONNE ACTIONS ---- */}
                    <td>
                      <div className="actions-container">
                        <button
                          className="action-btn update-btn"
                          onClick={() =>
                            this.setState({ showModifyModal: true, itemToModify: item })
                          }
                          title="Modifier"
                        >
                          <FiEdit size={18} />
                        </button>


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
            Total : {this.state.filteredstock.length}
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

        {/* Modale ajouter un produit */}
        {showStockModal && (
          <StockModal
            onClose={this.handleCloseStockModal}
            onRefresh={this.refreshStock}
          />
        )}


        {/* Modale modifier un produit */}

        {this.state.showModifyModal && (
          <ModifyStockModal
            item={this.state.itemToModify}
            onClose={() => this.setState({ showModifyModal: false, itemToModify: null })}
            onUpdateStock={this.updateStockInState}
          />
        )}



        {/* Message de confirmation de suppression */}
        {this.state.showDeleteAlert && this.state.itemToDelete && (
          <div className="delete-alert">
            <div className="delete-alert-content">
              <span>Voulez-vous vraiment supprimer le produit "{this.state.itemToDelete.produit}" ?</span>
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

        {/* Message OK après succès de suppression / erreur de suppression */}
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

export default Stock;
