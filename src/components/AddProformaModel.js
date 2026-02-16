import React, { Component } from "react";
import axios from "axios";

class ProformaModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // Infos client
      dateFacture: "",
      clientNom: "",

      // TVA
      tva: "", // par défaut 19%

      // Produits
      productsList: [],      // produits du backend
      filterNom: "",         // filtre en temps réel
      selectedProduct: null, // produit choisi pour remplir prix/quantité avant d'ajouter
      prixUnitaire: "",
      quantite: "",
      selectedProducts: [],  // produits ajoutés à la proforma

      // alert
      alertMessage: "",
      alertType: "",
      showList: false,
      isBlocking: false
    };
  }

  componentDidMount() {
    const today = new Date().toISOString().split("T")[0];

    this.setState({ dateFacture: today });

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
    const { selectedProduct, prixUnitaire, quantite, selectedProducts, tva } = this.state;

    if (tva === "" || tva === null || tva === undefined || isNaN(tva)) {
      this.setState({ alertMessage: "Veuillez renseigner la TVA (0% est accepté)", alertType: "error",isBlocking: true });
      return;
    }

    if (!selectedProduct) {
      this.setState({ alertMessage: "Veuillez choisir un produit", alertType: "error",isBlocking: true });
      return;
    }

    if (!prixUnitaire || prixUnitaire <= 0) {
      this.setState({ alertMessage: "Veuillez entrer un prix valide", alertType: "error",isBlocking: true });
      return;
    }

    if (!quantite || quantite <= 0) {
      this.setState({ alertMessage: "Veuillez entrer une quantité valide", alertType: "error",isBlocking: true });
      return;
    }

    // Vérifier la quantité disponible
    if (parseInt(quantite) > parseInt(selectedProduct.quantite)) {
      this.setState({ alertMessage: `Quantité insuffisante ! Stock disponible : ${selectedProduct.quantite}`, alertType: "error",isBlocking: true });
      return;
    }

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

    const newProduct = {
      id: selectedProduct._id,
      nom: selectedProduct.produit,
      prix: parseFloat(prixUnitaire),
      quantite: quantite
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
    const {dateFacture, clientNom, selectedProducts , tva} = this.state;

    if (selectedProducts.length === 0) {
      this.setState({ alertMessage: "Veuillez ajouter au moins un produit", alertType: "error",isBlocking: true });
      return;
    }

    const data = {
      dateFacture,
      clientNom,
      tva,
      produits: selectedProducts,
    };

    axios
      .post("http://localhost:8000/admin/Proformats/Ajouter", data, { withCredentials: true })
      .then((res) => {
        this.setState({
          alertMessage: res.data.message || "Proforma ajoutée avec succès !",
          alertType: "success",
          isBlocking: true,
          dateFacture: "",
          clientNom: "",
          tva: "",
          selectedProducts: [],
        });
        if (this.props.onRefresh) this.props.onRefresh();
      })
      .catch((err) => {
        this.setState({
          alertMessage: err.response?.data?.message || "Erreur lors de l'ajout de la proforma",
          alertType: "error",
          isBlocking: true
        });
      });
  };

  render() {
    const {dateFacture, clientNom,tva, productsList, filterNom, prixUnitaire, quantite, selectedProducts,
            alertMessage, alertType, showList
    } = this.state;

    // Produits filtrés
    const filteredProducts = productsList.filter(p =>
      p.produit?.toLowerCase().includes(filterNom.toLowerCase())
    );


    return (
      <form id="proforma-form" onSubmit={this.handleSubmit}>
        <div className="proforma-modal-overlay">
          <div className="proforma-modal">
            <div className="modal-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ margin: 0 }}>Ajouter une facture proforma</h3>
              <div className="top-buttons" style={{ display: "flex", gap: "10px" }}>
                <button type="submit" form="proforma-form">Envoyer la proforma</button>
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



            {/* Partie 1 : Infos client */}
            <div className="client-info" style={{ marginBottom: "20px" }}>
              <input type="text" name="clientNom" placeholder="Nom du client" value={clientNom} onChange={this.handleChange} required />
              <input
                type="number"
                name="tva"
                placeholder="TVA (%)"
                value={tva}
                onChange={(e) => this.setState({ tva: Number(e.target.value) })}
                min="0"
                max="100"
              />
              <input type="date" name="dateFacture" value={dateFacture} onChange={this.handleChange} required />
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

export default ProformaModal;
