import React, { Component } from "react";
import axios from "axios";

class AddAchatModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // Infos fournisseur
      dateCommande: "",
      fournisseurNom: "",
      modePaiement: "",

      // Produits
      productsList: [],
      filterNom: "",
      selectedProduct: null,
      prixUnitaire: "",
      quantite: "",
      selectedProducts: [],

      // alert
      alertMessage: "",
      alertType: "",
      showList: false,
      isBlocking: false
    };
  }

  componentDidMount() {
    const today = new Date().toISOString().split("T")[0];
    this.setState({ dateCommande: today });

    axios
      .get("http://localhost:8000/admin/Products", { withCredentials: true })
      .then((res) => {
        const produits = Array.isArray(res.data.data) ? res.data.data : [];
        this.setState({ productsList: produits });
      })
      .catch((err) => console.error("Erreur fetch produits:", err));
  }

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  handleAddProduct = () => {
    const { selectedProduct, filterNom, prixUnitaire, quantite, selectedProducts, productsList } = this.state;

    // Vérifier si l'utilisateur a entré un nom pour un produit non existant
    if (!selectedProduct && !filterNom) {
      this.setState({ alertMessage: "Veuillez choisir ou entrer un nom de produit", alertType: "error", isBlocking: true });
      return;
    }

    if (!prixUnitaire || prixUnitaire <= 0) {
      this.setState({ alertMessage: "Veuillez entrer un prix valide", alertType: "error", isBlocking: true });
      return;
    }

    if (!quantite || quantite <= 0) {
      this.setState({ alertMessage: "Veuillez entrer une quantité valide", alertType: "error", isBlocking: true });
      return;
    }

    let newProduct;

    if (selectedProduct) {
      // Produit existant dans le stock
      const exists = selectedProducts.find(p => p.id === selectedProduct._id);
      if (exists) {
        this.setState({
          alertMessage: "Produit déjà ajouté",
          alertType: "error",
          isBlocking: true,
          selectedProduct: null,
          prixUnitaire: "",
          quantite: "",
          filterNom: "",
        });
        return;
      }

      newProduct = {
        id: selectedProduct._id,
        nom: selectedProduct.produit,
        prix: parseFloat(prixUnitaire),
        quantite: quantite,
        estManuel: false // pour indiquer qu'il vient du stock
      };

    } else {
      // Produit non existant dans le stock
      // Vérifier si le nom existe déjà dans la liste sélectionnée
      const exists = selectedProducts.find(p => p.nom.toLowerCase() === filterNom.toLowerCase());
      if (exists) {
        this.setState({
          alertMessage: "Produit déjà ajouté",
          alertType: "error",
          isBlocking: true,
          prixUnitaire: "",
          quantite: "",
          filterNom: "",
        });
        return;
      }

      newProduct = {
        nom: filterNom,
        prix: parseFloat(prixUnitaire),
        quantite: quantite,
        estManuel: true // pour indiquer qu'il est ajouté manuellement
      };
    }

    // Ajouter le produit à la liste sélectionnée
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
    const { dateCommande, fournisseurNom, modePaiement, selectedProducts } = this.state;

    if (!fournisseurNom) {
      this.setState({ alertMessage: "Veuillez renseigner le fournisseur", alertType: "error", isBlocking: true });
      return;
    }

    if (!modePaiement) {
      this.setState({ alertMessage: "Veuillez choisir un mode de paiement", alertType: "error", isBlocking: true });
      return;
    }

    if (selectedProducts.length === 0) {
      this.setState({ alertMessage: "Veuillez ajouter au moins un produit", alertType: "error", isBlocking: true });
      return;
    }

    const data = {
      dateCommande,
      fournisseurNom,
      modePaiement,
      produits: selectedProducts,
    };

    axios
      .post("http://localhost:8000/admin/Achats/Ajouter", data, { withCredentials: true })
      .then((res) => {
        this.setState({
          alertMessage: res.data.message || "Achat ajouté avec succès !",
          alertType: "success",
          isBlocking: true,
          dateCommande: "",
          fournisseurNom: "",
          modePaiement: "",
          selectedProducts: [],
        });
        if (this.props.onRefresh) this.props.onRefresh();
      })
      .catch((err) => {
        this.setState({
          alertMessage: err.response?.data?.message || "Erreur lors de l'ajout de l'achat",
          alertType: "error",
          isBlocking: true
        });
      });
  };

  render() {
    const { dateCommande, fournisseurNom, modePaiement, productsList, filterNom, prixUnitaire, quantite, selectedProducts,
            alertMessage, alertType, showList } = this.state;

    const filteredProducts = productsList.filter(p =>
      p.produit?.toLowerCase().includes(filterNom.toLowerCase())
    );

    return (
      <form id="achat-form" onSubmit={this.handleSubmit}>
        <div className="proforma-modal-overlay">
          <div className="proforma-modal">
            <div className="modal-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ margin: 0 }}>Ajouter un achat fournisseur</h3>
              <div className="top-buttons" style={{ display: "flex", gap: "10px" }}>
                {/* Enregistrer l'achat */}
                <button type="submit" form="achat-form">Enregistrer l'achat</button>
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
                  <p>{alertMessage}</p>
                </div>
                <button className="alert-btn" onClick={() => this.setState({ alertMessage: "", alertType: "", isBlocking: false })}>OK</button>
              </div>
            )}

            {/* Infos fournisseur */}
            <div className="client-info" style={{ marginBottom: "20px" }}>
              <input type="text" name="fournisseurNom" placeholder="Nom du fournisseur" value={fournisseurNom} onChange={this.handleChange} required />
              <input type="date" name="dateCommande" value={dateCommande} onChange={this.handleChange} required />

              {/* Mode de paiement dropdown */}
              <select name="modePaiement" value={modePaiement} onChange={this.handleChange} required>
                <option value="">-- Choisir le mode de paiement --</option>
                <option value="Espèces">Espèces</option>
                <option value="Carte Bancaire">Carte Bancaire</option>
                <option value="Virement Bancaire">Virement Bancaire</option>
                <option value="Chèque">Chèque</option>
              </select>
            </div>

            {/* Produits */}
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
                  />
                  {showList && filterNom && (
                    <div className="autocomplete-list">
                      {filteredProducts.length > 0 ? (
                        filteredProducts.map((p) => (
                          <div key={p._id} onClick={() => this.setState({ selectedProduct: p, prixUnitaire: p.prixUnitaire, filterNom: p.produit, showList: false })}>
                            {p.produit}
                          </div>
                        ))
                      ) : (
                        <div>Aucun produit trouvé</div>
                      )}
                    </div>
                  )}
                </div>

                <input type="number" className="number-input" placeholder="Prix unitaire" value={prixUnitaire || ""} onChange={(e) => this.setState({ prixUnitaire: e.target.value })} min="0" />
                <input type="text" className="number-input" placeholder="Quantité" value={quantite || ""} onChange={(e) => this.setState({ quantite: e.target.value })} />
                <button type="button" onClick={this.handleAddProduct}>Ajouter</button>
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
                        <td colSpan="4" style={{ textAlign: "center", fontStyle: "italic", color: "#888" }}>Aucun produit sélectionné</td>
                      </tr>
                    ) : (
                      selectedProducts.map(p => (
                        <tr key={p.id}>
                          <td>{p.nom}</td>
                          <td>{p.prix.toFixed(2)}</td>
                          <td>{p.quantite}</td>
                          <td><button type="button" onClick={() => this.handleRemoveProduct(p.id)}>Supprimer</button></td>
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

export default AddAchatModal;
