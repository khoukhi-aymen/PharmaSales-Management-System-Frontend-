import React, { Component } from "react";
import axios from "axios";

class ModifyAchatModal extends Component {
  constructor(props) {
    super(props);

    const { achat } = props;

    this.state = {
      // Infos fournisseur (pré-remplies)
      dateCommande: achat.dateCommande?.split("T")[0] || "",
      fournisseurNom: achat.fournisseurNom || "",
      modePaiement: achat.modePaiement || "",   
      AchatEtat: achat.etat || "brouillon",

      // Produits (pré-remplis)
      productsList: [],
      filterNom: "",
      selectedProduct: null,
      prixUnitaire: "",
      quantite: "",
      selectedProducts: achat.produits
        ? achat.produits.map((p) => ({
            id: p.id || null,
            nom: String(p.nom),
            prix: Number(p.prix),
            quantite: String(p.quantite),
            estManuel: !!p.estManuel,
          }))
        : [],

      // alert
      alertMessage: "",
      alertType: "",
      showList: false,
      isBlocking: false,
    };
  }

  componentDidMount() {
    axios
      .get("http://localhost:8000/admin/Products", { withCredentials: true })
      .then((res) => {
        this.setState({
          productsList: Array.isArray(res.data.data) ? res.data.data : [],
        });
      })
      .catch((err) => {
        console.error("Erreur récupération produits :", err);
      });
  }

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  handleAddProduct = () => {
    const { selectedProduct, filterNom, prixUnitaire, quantite, selectedProducts } = this.state;

    if (!selectedProduct && !filterNom) {
      return this.setState({
        alertMessage: "Veuillez choisir ou entrer un nom de produit",
        alertType: "error",
        isBlocking: true,
      });
    }

    if (!prixUnitaire || prixUnitaire <= 0) {
      return this.setState({
        alertMessage: "Veuillez entrer un prix valide",
        alertType: "error",
        isBlocking: true,
      });
    }

    if (!quantite || quantite <= 0) {
      return this.setState({
        alertMessage: "Veuillez entrer une quantité valide",
        alertType: "error",
        isBlocking: true,
      });
    }

    let newProduct;

    if (selectedProduct) {
      // Produit existant dans le stock
      const exists = selectedProducts.find((p) => p.id === selectedProduct._id);
      if (exists) {
        return this.setState({
          alertMessage: "Produit déjà ajouté",
          alertType: "error",
          isBlocking: true,
          selectedProduct: null,
          prixUnitaire: "",
          quantite: "",
          filterNom: "",
        });
      }

      newProduct = {
        id: selectedProduct._id,
        nom: String(selectedProduct.produit || selectedProduct.nom),
        prix: Number(prixUnitaire),
        quantite: String(quantite),
        estManuel: false,
      };
    } else {
      // Produit ajouté manuellement
      const exists = selectedProducts.find((p) => p.nom.toLowerCase() === filterNom.toLowerCase());
      if (exists) {
        return this.setState({
          alertMessage: "Produit déjà ajouté",
          alertType: "error",
          isBlocking: true,
          prixUnitaire: "",
          quantite: "",
          filterNom: "",
        });
      }

      newProduct = {
        id: null,
        nom: String(filterNom),
        prix: Number(prixUnitaire),
        quantite: String(quantite),
        estManuel: true,
      };
    }

    this.setState({
      selectedProducts: [...selectedProducts, newProduct],
      selectedProduct: null,
      prixUnitaire: "",
      quantite: "",
      filterNom: "",
      isBlocking: false,
    });
  };

  handleRemoveProduct = (id) => {
    this.setState({
      selectedProducts: this.state.selectedProducts.filter((p) => p.id !== id),
    });
  };

  handleSubmit = (e) => {
    e.preventDefault();

    const { achat } = this.props;
    const { selectedProducts, fournisseurNom, modePaiement, dateCommande } = this.state;

    if (achat.etat === "validée") {
      return this.setState({
        alertMessage: "Modification interdite : commande validée",
        alertType: "error",
        isBlocking: true,
      });
    }

    if (!fournisseurNom) {
      return this.setState({
        alertMessage: "Veuillez renseigner le fournisseur",
        alertType: "error",
        isBlocking: true,
      });
    }

    if (!modePaiement) {
      return this.setState({
        alertMessage: "Veuillez choisir un mode de paiement",
        alertType: "error",
        isBlocking: true,
      });
    }

    const updatedAchat = {
      ...achat,
      fournisseurNom,
      modePaiement,
      dateCommande,
      produits: selectedProducts,
    };

    axios
      .put(`http://localhost:8000/admin/Achats/Modifier/${achat._id}`, updatedAchat, {
        withCredentials: true,
      })
      .then((res) => {
        const updatedAchatFromServer = res.data.achat;

        this.setState({
          alertMessage: res.data.message,
          alertType: "success",
          isBlocking: false,

          // SYNCHRO DIRECTE DU MODAL
          AchatEtat: updatedAchatFromServer.etat,
          fournisseurNom: updatedAchatFromServer.fournisseurNom,
          modePaiement: updatedAchatFromServer.modePaiement,
          dateCommande: updatedAchatFromServer.dateCommande.split("T")[0],
          selectedProducts: updatedAchatFromServer.produits.map(p => ({
            id: p.id || null,
            nom: String(p.nom),
            prix: Number(p.prix),
            quantite: String(p.quantite),
            estManuel: !!p.estManuel
          }))
        });

        // Mise à jour du parent
        if (this.props.onUpdateAchat) {
          this.props.onUpdateAchat(updatedAchatFromServer);
        }
      })
      .catch((err) => {
        this.setState({
          alertMessage: err.response?.data?.message || "Erreur modification",
          alertType: "error",
          isBlocking: true,
        });
      });
  };

  handleChangeEtat = (nouvelEtat) => {
    const { achat } = this.props;

    axios.put(
      `http://localhost:8000/admin/Achats/ModifierEtat/${achat._id}`,
      { etat: nouvelEtat },
      { withCredentials: true }
    )
      .then(res => {
        const updatedAchat = res.data.achat;

        // Mise à jour immédiate du modal
        this.setState({
          AchatEtat: updatedAchat.etat,
          alertMessage: res.data.message,
          alertType: "success",
          isBlocking: false
        });

        // Mise à jour du parent
        if (this.props.onUpdateAchat) {
          this.props.onUpdateAchat(updatedAchat);
        }
      })
      .catch(err => {
        this.setState({
          alertMessage: err.response?.data?.message || "Erreur changement état",
          alertType: "error",
          isBlocking: true
        });
      });
  };


  render() {
    const { dateCommande, fournisseurNom, modePaiement, productsList, filterNom, prixUnitaire, quantite, selectedProducts, alertMessage, alertType, showList } = this.state;

    // Définir une variable pour savoir si le formulaire est éditable
    const isEditable = this.state.AchatEtat === "brouillon";
    

    const filteredProducts = productsList.filter((p) =>
      (p.produit || p.nom || "").toLowerCase().includes(filterNom.toLowerCase())
    );

    return (
      <form id="achat-form" onSubmit={this.handleSubmit}>
        <div className="proforma-modal-overlay">
          <div className="proforma-modal">
            <div className="modal-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ margin: 0 }}>Modifier un achat fournisseur</h3>
              <div className="top-buttons" style={{ display: "flex", gap: "10px" }}>

                {/* Boutons de changement d'état */}

                {this.state.AchatEtat === "brouillon" && (
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
                  form="achat-form">
                    Valider les modifications
                  </button>
                )}

                {this.state.AchatEtat === "validée" && (
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

            {alertMessage && (
              <div className={`advanced-alert ${alertType}`}>
                <div className="alert-content">
                  <p>{String(alertMessage)}</p>
                </div>
                <button
                  className="alert-btn"
                  onClick={() => this.setState({ alertMessage: "", alertType: "", isBlocking: false })}
                >
                  OK
                </button>
              </div>
            )}

            <div className="client-info" style={{ marginBottom: "20px" }}>
              <input
                type="text"
                name="fournisseurNom"
                placeholder="Nom du fournisseur"
                value={fournisseurNom} onChange={this.handleChange}
                required
                disabled={!isEditable} // Bloque si pas brouillon
              />
              <input type="date"
                name="dateCommande"
                value={dateCommande}
                onChange={this.handleChange}
                disabled={!isEditable} // Bloque si pas brouillon 
                required
              />
              <select name="modePaiement" value={modePaiement} onChange={this.handleChange} required disabled={!isEditable} // Bloque si pas brouillon
              >
                <option value="">-- Choisir le mode de paiement --</option>
                <option value="Espèces">Espèces</option>
                <option value="Carte Bancaire">Carte Bancaire</option>
                <option value="Virement Bancaire">Virement Bancaire</option>
                <option value="Chèque">Chèque</option>
              </select>
            </div>

            <div className="products-section" style={{ marginBottom: "20px" }}>
              <h4>Ajouter des produits</h4>
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
                    disabled={!isEditable} // Bloque si pas brouillon
                  />
                  {showList && filterNom && (
                    <div className="autocomplete-list">
                      {filteredProducts.length > 0 ? (
                        filteredProducts.map((p) => (
                          <div
                            key={p._id}
                            onClick={() =>
                              this.setState({
                                selectedProduct: p,
                                prixUnitaire: p.prixUnitaire || p.prix || "",
                                filterNom: p.produit || p.nom || "",
                                showList: false,
                              })
                            }
                          >
                            {p.produit || p.nom}
                          </div>
                        ))
                      ) : (
                        <div>Aucun produit trouvé</div>
                      )}
                    </div>
                  )}
                </div>

                <input type="number"
                  className="number-input"
                  placeholder="Prix unitaire"
                  value={prixUnitaire || ""}
                  onChange={(e) => this.setState({ prixUnitaire: e.target.value })} min="0"
                  disabled={!isEditable} // Bloque si pas brouillon
                />
                <input
                  type="text"
                  className="number-input"
                  placeholder="Quantité"
                  value={quantite || ""}
                  onChange={(e) => this.setState({ quantite: e.target.value })}
                  disabled={!isEditable} // Bloque si pas brouillon
                />
                <button type="button" onClick={this.handleAddProduct}
                  disabled={!isEditable} // Bloque si pas brouillon
                >
                  Ajouter
                </button>
              </div>

              <div className="selected-products">
                <table className="selected-products-table">
                  <thead>
                    <tr>
                      <th>Produit</th>
                      <th>Prix (€)</th>
                      <th>Quantité</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedProducts.length === 0 ? (
                      <tr>
                        <td colSpan="4" style={{ textAlign: "center", fontStyle: "italic", color: "#888" }}>
                          Aucun produit sélectionné
                        </td>
                      </tr>
                    ) : (
                      selectedProducts.map((p, idx) => (
                        <tr key={p.id || p.nom + idx}>
                          <td>{String(p.nom)}</td>
                          <td>{typeof p.prix === "number" ? p.prix.toFixed(2) : String(p.prix)}</td>
                          <td>{String(p.quantite)}</td>
                          <td>
                            <button type="button" 
                            onClick={() => this.handleRemoveProduct(p.id)} disabled={!isEditable} // Bloque si pas brouillon
                            >
                              Supprimer
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {this.state.isBlocking && <div className="blocking-overlay"></div>}
          </div>
        </div>
      </form>
    );
  }
}

export default ModifyAchatModal;
