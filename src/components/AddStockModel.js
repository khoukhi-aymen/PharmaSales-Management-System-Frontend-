import React, { Component } from "react";
import axios from "axios";

class StockModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      produit: "",
      prixUnitaire: "",
      quantite: "",
      dateEntree: "",
      dateExpiration: "",
      fournisseur: "",
      alertMessage: "",
      alertType: "",
      isBlocking: false
    };
  }


  componentDidMount() {
    const today = new Date().toISOString().split("T")[0];
    this.setState({ dateEntree: today });
  }


  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  closeAlert = () => {
    this.setState({ alertMessage: "", alertType: "",isBlocking: false });
    this.props.onClose(); // fermer la modale
  };

  handleSubmit = (e) => {
    e.preventDefault();

    const data = {
      produit: this.state.produit,
      prixUnitaire: this.state.prixUnitaire,
      quantite: this.state.quantite,
      dateEntree: this.state.dateEntree,
      dateExpiration: this.state.dateExpiration,
      fournisseur: this.state.fournisseur,
    };

    axios
      .post("http://localhost:8000/admin/Stock/AjouterProduit", data, {
        withCredentials: true,
      })
      .then((res) => {
        this.setState({
          alertMessage: res.data.message,
          alertType: "success",
          isBlocking: true,
          produit: "",
          prixUnitaire: "",
          quantite: "",
          dateEntree: "",
          dateExpiration: "",
          fournisseur: "",
        });

        // Appeler la fonction du parent pour rafraîchir la liste
        if (this.props.onRefresh) {
          this.props.onRefresh();
        }
      })
      .catch((err) => {
        this.setState({
          alertMessage: err.response?.data?.message || "Erreur lors de l'ajout du produit.",
          alertType: "error",
          isBlocking: true
        });
      });
  };


  render() {
    const {
      produit,
      prixUnitaire,
      quantite,
      dateEntree,
      dateExpiration,
      fournisseur,
      alertMessage,
      alertType,
    } = this.state;

    return (
      <div className="stock-modal-overlay">
        <div className="stock-modal">
          <h3>Ajouter un produit au stock</h3>

         {/* Alerte message de succes /error lors de l'ajout d'un produit */}
          {alertMessage && (
            <div className={`advanced-alert ${alertType}`}>
              <div className="alert-content">
                <p>{alertMessage}</p>
              </div>
              <button className="alert-btn" onClick={() => this.setState({ alertMessage: "", alertType: "",isBlocking: false, })}>
                OK
              </button>
            </div>
          )}

          <form onSubmit={this.handleSubmit}>
            <input
              type="text"
              name="produit"
              placeholder="Produit"
              value={produit}
              onChange={this.handleChange}
              required
            />

            <input
              type="number"
              name="prixUnitaire"
              placeholder="Prix unitaire (DA)"
              value={prixUnitaire}
              onChange={this.handleChange}
              required
              min="0"
            />


            <input
              type="text"
              name="quantite"
              placeholder="Quantité"
              value={quantite}
              onChange={this.handleChange}
              required
            />

            <input
              type="date"
              name="dateEntree"
              value={dateEntree}
              onChange={this.handleChange}
              required
            />

            <input
              type="date"
              name="dateExpiration"
              placeholder="Date d'expiration"
              value={dateExpiration}
              onChange={this.handleChange}
              required
            />

            <input
              type="text"
              name="fournisseur"
              placeholder="Fournisseur"
              value={fournisseur}
              onChange={this.handleChange}
              required
            />

            <div className="modal-buttons">
              <button type="submit">Ajouter</button>
              <button type="button" onClick={this.props.onClose}>
                ✕ Fermer
              </button>
            </div>
          </form>

          {/* blockage du model de succés/erreur */}
          {this.state.isBlocking && (
            <div className="blocking-overlay"></div>
          )}
        </div>
      </div>
    );
  }
}

export default StockModal;
