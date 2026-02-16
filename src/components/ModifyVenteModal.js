import React, { Component } from "react";
import axios from "axios";

class UpdateVenteModal extends Component {
  constructor(props) {
    super(props);
    const vente = props.vente || {}; // La vente à modifier
    this.state = {
      dateVente: vente.dateVente ? vente.dateVente.split("T")[0] : "",
      clientNom: vente.clientNom || "",
      venteEtat: vente.etat || "brouillon",
      tva: vente.tva || "",

      productsList: [],
      filterNom: "",
      selectedProduct: null,
      prixUnitaire: "",
      quantite: "",
      selectedProducts: vente.produits ? vente.produits.map(p => ({
        id: p.id || p._id,
        nom: p.nom,
        prix: p.prix,
        quantite: p.quantite
      })) : [],

      alertMessage: "",
      alertType: "",
      showList: false,
      isBlocking: false
    };
  }

  componentDidMount() {
    axios.get("http://localhost:8000/admin/Products", { withCredentials: true })
      .then(res => {
        this.setState({
          productsList: Array.isArray(res.data.data) ? res.data.data : []
        });
      });
  }

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  handleAddProduct = () => {
    const { selectedProduct, prixUnitaire, quantite, selectedProducts } = this.state;

    if (!selectedProduct) return this.setState({ alertMessage: "Veuillez choisir un produit", alertType: "error",isBlocking: true });
    if (!prixUnitaire || prixUnitaire <= 0) return this.setState({ alertMessage: "Prix invalide", alertType: "error",isBlocking: true });
    if (!quantite || quantite <= 0) return this.setState({ alertMessage: "Quantité invalide", alertType: "error",isBlocking: true });
    if (parseInt(quantite) > parseInt(selectedProduct.quantite)) {
      return this.setState({ alertMessage: `Stock insuffisant : ${selectedProduct.quantite}`, alertType: "error",isBlocking: true });
    }
    if (selectedProducts.find(p => p.id === selectedProduct._id)) {
      return this.setState({ alertMessage: "Produit déjà ajouté", alertType: "error",isBlocking: true, selectedProduct: null, prixUnitaire: "", quantite: "", filterNom: "" });
    }

    const newProduct = {
      id: selectedProduct._id,
      nom: selectedProduct.produit,
      prix: parseFloat(prixUnitaire),
      quantite
    };

    this.setState({
      selectedProducts: [...selectedProducts, newProduct],
      selectedProduct: null,
      isBlocking: false,
      prixUnitaire: "",
      quantite: "",
      filterNom: "",
    });
  };

  handleRemoveProduct = (id) => {
    this.setState({
      selectedProducts: this.state.selectedProducts.filter(p => p.id !== id)
    });
  };

  handleSubmit = (e) => {
    e.preventDefault();

    const { dateVente, clientNom, tva, selectedProducts } = this.state;

    if (selectedProducts.length === 0) {
      return this.setState({
        alertMessage: "Ajoutez au moins un produit",
        alertType: "error",
        isBlocking: true
      });
    }

    const data = {
      dateVente,
      clientNom,
      tva,
      produits: selectedProducts
    };

    axios.put(
      `http://localhost:8000/admin/Ventes/Modifier/${this.props.vente._id}`,
      data,
      { withCredentials: true }
    )
      .then(res => {
        const updatedVente = res.data.vente;

        this.setState({
          venteEtat: updatedVente.etat,
          alertMessage: res.data.message,
          alertType: "success",
          isBlocking: true
        });

        // Synchronisation avec le parent
        if (this.props.onUpdateVente) {
          this.props.onUpdateVente(updatedVente);
        }
      })
      .catch(err => {
        console.error(err);
        this.setState({
          alertMessage: err.response?.data?.message || "Erreur lors de la modification",
          alertType: "error",
          isBlocking: true
        });
      });
  };



  handleChangeEtat = (nouvelEtat) => {
    const { _id } = this.props.vente;
    axios.put(`http://localhost:8000/admin/Ventes/ModifierEtat/${_id}`, { etat: nouvelEtat }, { withCredentials: true })
      .then(res => {
        this.setState({ 
          venteEtat: nouvelEtat, 
          alertMessage: res.data.message || `Etat changé en ${nouvelEtat}`, 
          alertType: "success",
          isBlocking: true 
        });
        // On renvoie la mise à jour au parent
        if (this.props.onUpdateVente) {
          this.props.onUpdateVente({ ...this.props.vente, etat: nouvelEtat });
        }
      })
      .catch(err => {
        console.error(err);
        this.setState({
          alertMessage:  err.response?.data?.message , 
          alertType: "error",
          isBlocking: true
        });
      });
  };



  render() {
    const { dateVente, clientNom, tva, productsList, filterNom, prixUnitaire, quantite, selectedProducts, alertMessage, alertType, showList } = this.state;
    // Définir une variable pour savoir si le formulaire est éditable
    const isEditable = this.state.venteEtat === "brouillon";

    const filteredProducts = productsList.filter(p =>
      p.produit?.toLowerCase().includes(filterNom.toLowerCase())
    );

    return (
      <form onSubmit={this.handleSubmit}>
        <div className="proforma-modal-overlay">
          <div className="proforma-modal">
            <div className="modal-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3>Modifier la commande Client</h3>
              <div className="top-buttons" style={{ display: "flex", gap: "10px" }}>

                {/* Boutons de changement d'état */}
                {this.state.venteEtat === "brouillon" && (
                  <button type="submit" className="validate-btn"
                    style={{
                      fontWeight: "600",
                      textAlign: "center",
                      padding: "8px 12px",
                      borderRadius: "12px",
                      color: "#fff",
                      background: "linear-gradient(135deg, #34d399, #10b981)", // vert dégradé
                      boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                      transition: "all 0.3s ease",
                      minWidth: "90px"
                    }}
                  >Valider les modifications</button>
                )}

                {this.state.venteEtat === "validée" && (
                  <>
                    <button type="button" className="back-btn"
                      style={{
                        fontWeight: "600",
                        textAlign: "center",
                        padding: "8px 12px",
                        borderRadius: "12px",
                        color: "#fff",
                        background: "linear-gradient(135deg, #fbbf24, #f59e0b)", // orange dégradé
                        boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                        transition: "all 0.3s ease",
                        minWidth: "90px"
                      }}
                      onClick={() => this.handleChangeEtat("brouillon")}>Revenir à Brouillon</button>
                    <button type="button" className="deliver-btn"
                      style={{
                        fontWeight: "600",
                        textAlign: "center",
                        padding: "8px 12px",
                        borderRadius: "12px",
                        color: "#fff",
                        background: "linear-gradient(135deg, #3b82f6, #2563eb)", // bleu dégradé
                        boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                        transition: "all 0.3s ease",
                        minWidth: "90px"
                      }}
                      onClick={() => this.handleChangeEtat("livrée")}>Livrer</button>
                  </>
                )}

                {this.state.venteEtat === "livrée" && (
                  <>
                    <button type="button" className="back-btn"
                      style={{
                        fontWeight: "600",
                        textAlign: "center",
                        padding: "8px 12px",
                        borderRadius: "12px",
                        color: "#fff",
                        background: "linear-gradient(135deg, #fbbf24, #f59e0b)", // orange dégradé
                        boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                        transition: "all 0.3s ease",
                        minWidth: "90px"
                      }}

                      onClick={() => this.handleChangeEtat("brouillon")}>Revenir à Brouillon</button>
                    <button type="button" className="invoice-btn"
                      style={{
                        fontWeight: "600",
                        textAlign: "center",
                        padding: "8px 12px",
                        borderRadius: "12px",
                        color: "#fff",
                        background: "linear-gradient(135deg, #8b5cf6, #a78bfa)", // violet dégradé
                        boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                        transition: "all 0.3s ease",
                        minWidth: "90px"
                      }}

                      onClick={() => this.handleChangeEtat("facturée")}>Facturer</button>
                  </>
                )}

                {this.state.venteEtat === "facturée" && (
                  <button type="button" className="back-btn"
                    style={{
                      fontWeight: "600",
                      textAlign: "center",
                      padding: "8px 12px",
                      borderRadius: "12px",
                      color: "#fff",
                      background: "linear-gradient(135deg, #3b82f6, #2563eb)", // bleu dégradé
                      boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                      transition: "all 0.3s ease",
                      minWidth: "90px"
                    }}
                    onClick={() => this.handleChangeEtat("livrée")}>Revenir à Livrée</button>
                )}

               {/* Bouton Fermer */}
               <button
                  type="button"
                  onClick={this.props.onClose}
                  className="close-modal-btn"
                >
                  ✕ Fermer
                </button>
              </div>
            </div>

            {/* Alerte message de succes /error lors de la modification d'une Vente*/}

            {alertMessage && (
              <div className={`advanced-alert ${alertType}`}>
                <div className="alert-content"><p>{alertMessage}</p></div>
                <button className="alert-btn" onClick={() => this.setState({ alertMessage: "", alertType: "" ,isBlocking: false})}>OK</button>
              </div>
            )}
            <div className="client-info">
              <input
                name="clientNom"
                placeholder="Nom du client"
                value={clientNom}
                onChange={this.handleChange}
                required
                disabled={!isEditable}
              />
              <input
                type="number"
                placeholder="TVA (%)"
                value={tva}
                onChange={(e) => this.setState({ tva: Number(e.target.value) })}
                disabled={!isEditable}
              />
              <input
                type="date"
                name="dateVente"
                value={dateVente}
                onChange={this.handleChange}
                required
                disabled={!isEditable}
              />
              
            </div>

            {/* Produits */}
            <div className="products-section" style={{ marginBottom: "20px" }}>
              <h4>Modifier les produits</h4>
              <div className="products-controls">
                <div style={{ flex: 1, position: "relative" }}>
                  <input
                    type="text"
                    className="autocomplete"
                    placeholder="Rechercher un produit..."
                    value={filterNom || ""}
                    onChange={(e) => this.setState({ filterNom: e.target.value, showList: true })}
                    onFocus={() => this.setState({ showList: true })}
                    onBlur={() => setTimeout(() => this.setState({ showList: false }), 150)}
                    disabled={!isEditable} // Bloque la recherche si pas brouillon
                  />
                  {showList && filterNom && (
                    <div className="autocomplete-list">
                      {filteredProducts.length > 0 ? (
                        filteredProducts.map((p) => (
                          <div key={p._id} onClick={() => this.setState({ selectedProduct: p, prixUnitaire: p.prixUnitaire, filterNom: p.produit, showList: false })}>
                            {p.produit}
                          </div>
                        ))
                      ) : <div>Aucun produit trouvé</div>}
                    </div>
                  )}
                </div>


                {/* Prix unitaire */}
                <input
                  type="number"
                  className="number-input"
                  placeholder="Prix unitaire"
                  value={prixUnitaire || ""}
                  onChange={(e) => this.setState({ prixUnitaire: e.target.value })}
                  min="0"
                  disabled={!isEditable} // Bloque si pas brouillon
                />

                {/* Quantité */}
                <input type="text"
                  className="number-input"
                  placeholder="Quantité"
                  value={quantite || ""}
                  onChange={(e) => this.setState({ quantite: e.target.value })}
                  disabled={!isEditable} // Bloque si pas brouillon
                />

                {/* Bouton Ajouter */}
                <button
                  type="button"
                  onClick={this.handleAddProduct}
                  disabled={!isEditable} // Bloque si pas brouillon
                >
                  Ajouter
                </button>
              </div>

              {/* Produits ajoutés */}
              <div className="selected-products">
                <table className="selected-products-table">
                  <thead>
                    <tr>
                      <th>Produit</th><th>Prix (€)</th><th>Quantité</th><th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedProducts.length === 0 ? (
                      <tr><td colSpan="4" style={{ textAlign: "center", fontStyle: "italic", color: "#888" }}>Aucun produit sélectionné</td></tr>
                    ) : selectedProducts.map(p => (
                      <tr key={p.id}>
                        <td>{p.nom}</td>
                        <td>{p.prix.toFixed(2)}</td>
                        <td>{p.quantite}</td>
                        <td>
                          <button type="button"
                            onClick={() => this.handleRemoveProduct(p.id)}
                            disabled={!isEditable} // Bloque si pas brouillon
                          >Supprimer
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* blockage du model de succés/erreur */}
            {this.state.isBlocking && (
              <div className="blocking-overlay"></div>
            )}

          </div>
        </div>
      </form>
    );
  }
}

export default UpdateVenteModal;
