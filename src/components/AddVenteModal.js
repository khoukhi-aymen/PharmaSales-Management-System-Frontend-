import React, { Component } from "react";
import axios from "axios";

class AddVenteModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dateVente: "",
      clientNom: "",
      tva: "",

      productsList: [],
      filterNom: "",
      selectedProduct: null,
      prixUnitaire: "",
      quantite: "",
      selectedProducts: [],

      alertMessage: "",
      alertType: "",
      showList: false
    };
  }

  componentDidMount() {
    const today = new Date().toISOString().split("T")[0];
    this.setState({ dateVente: today });

    axios
      .get("http://localhost:8000/admin/Products", { withCredentials: true })
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

    // Vérification du produit sélectionné
    if (!selectedProduct) {
      return this.setState({ alertMessage: "Veuillez choisir un produit", alertType: "error",isBlocking: true });
    }

    // Vérification du prix
    if (!prixUnitaire || prixUnitaire <= 0) {
      return this.setState({ alertMessage: "Veuillez entrer un prix valide", alertType: "error",isBlocking: true });
    }

    // Vérification de la quantité
    if (!quantite || quantite <= 0) {
      return this.setState({ alertMessage: "Veuillez entrer une quantité valide", alertType: "error",isBlocking: true });
    }

    // Vérifier stock
    if (parseInt(quantite) > parseInt(selectedProduct.quantite)) {
      return this.setState({
        alertMessage: `Quantité insuffisante ! Stock disponible : ${selectedProduct.quantite}`,
        alertType: "error",
        isBlocking: true
      });
    }

    // Vérifier si le produit est déjà ajouté
    const exists = selectedProducts.find(p => p.id === selectedProduct._id);
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

    // Ajouter le produit
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
    console.log("Submit déclenché !");
    const { dateVente, clientNom, tva, selectedProducts } = this.state;

    if (selectedProducts.length === 0) {
      return this.setState({ alertMessage: "Ajoutez au moins un produit", alertType: "error",isBlocking: true });
    }

    const data = {
      dateVente,
      clientNom,
      tva,
      produits: selectedProducts
    };

    console.log("Data envoyée :", data);

    axios
      .post("http://localhost:8000/admin/Ventes/Ajouter", data, { withCredentials: true })
      .then(res => {
        console.log(res.data);
        this.setState({
          alertMessage: res.data.message || "Commande créée avec succès",
          alertType: "success",
          isBlocking: true,
          clientNom: "",
          tva: "",
          selectedProducts: []
        });
        if (this.props.onRefresh) this.props.onRefresh();
      })
      .catch(err => {
        console.error(err);
        this.setState({ alertMessage: "Erreur création commande", alertType: "error",isBlocking: true });
      });
  };


  render() {
    const { dateVente, clientNom, tva, productsList, filterNom, prixUnitaire, quantite,
      selectedProducts, alertMessage, alertType, showList } = this.state;

    const filteredProducts = productsList.filter(p =>
      p.produit?.toLowerCase().includes(filterNom.toLowerCase())
    );

    return (
      <form onSubmit={this.handleSubmit}>
        <div className="proforma-modal-overlay">
          <div className="proforma-modal">

            <div className="modal-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3>Ajouter une commande client</h3>
              <div className="top-buttons" style={{ display: "flex", gap: "10px" }}>
                <button type="submit">Créer la Commande</button>
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
                <button className="alert-btn" onClick={() => this.setState({ alertMessage: "", alertType: "",isBlocking: false })}>OK</button>
              </div>
            )}

            <div className="client-info">
              <input name="clientNom" placeholder="Nom du client" value={clientNom} onChange={this.handleChange} required />
              <input type="number" placeholder="TVA (%)" value={tva} onChange={(e) => this.setState({ tva: Number(e.target.value) })} />
              <input type="date" name="dateVente" value={dateVente} onChange={this.handleChange} required />
            </div>

            {/* Partie 2 : Produits */}

            <div className="products-section" style={{ marginBottom: "20px" }}>
              <h4>Ajouter des produits</h4>
              <div className="products-controls">
                {/* Champ autocomplete */}
                <div style={{ flex: 1, position: "relative" }}>
                  <input
                    type="text"
                    className="autocomplete"
                    placeholder="Rechercher un produit..."
                    value={filterNom || ""}
                    onChange={(e) => this.setState({ filterNom: e.target.value, showList: true })}
                    onFocus={() => this.setState({ showList: true })}
                    onBlur={() => setTimeout(() => this.setState({ showList: false }), 150)} // ferme la liste après sélection
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
                                prixUnitaire: p.prixUnitaire,
                                filterNom: p.produit,
                                showList: false
                              })
                            }
                          >
                            {p.produit}
                          </div>
                        ))
                      ) : (
                        <div>Aucun produit trouvé</div>
                      )}
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
                />

                {/* Quantité */}
                <input
                  type="text"
                  className="number-input"
                  placeholder="Quantité"
                  value={quantite || ""}
                  onChange={(e) => this.setState({ quantite: e.target.value })}
                />



                {/* Bouton Ajouter */}
                <button type="button" onClick={this.handleAddProduct}>Ajouter</button>
              </div>


              {/* Produits ajoutés */}
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
                      selectedProducts.map(p => (
                        <tr key={p.id}>
                          <td>{p.nom}</td>
                          <td>{p.prix.toFixed(2)}</td>
                          <td>{p.quantite}</td>
                          <td>
                            <button type="button" onClick={() => this.handleRemoveProduct(p.id)}>Supprimer</button>
                          </td>
                        </tr>
                      ))
                    )}
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

export default AddVenteModal;
