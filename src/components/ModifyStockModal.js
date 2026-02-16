import React, { Component } from "react";
import axios from "axios";

class ModifyStockModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      produit: props.item.produit,
      prixUnitaire: props.item.prixUnitaire || 0,
      quantite: props.item.quantite,
      dateEntree: props.item.dateEntree.slice(0, 10),
      dateExpiration: props.item.dateExpiration.slice(0, 10),
      fournisseur: props.item.fournisseur,
      alertMessage: "",
      alertType: "",
      isBlocking: false
    };
  }

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  closeAlert = () => {
    this.setState({ alertMessage: "", alertType: "",isBlocking: false });
    this.props.onClose();
  };

  handleSubmit = (e) => {
    e.preventDefault();

    const {
      produit,
      prixUnitaire,
      quantite,
      dateEntree,
      dateExpiration,
      fournisseur,
    } = this.state;

    const data = {
      produit,
      prixUnitaire: parseFloat(prixUnitaire),
      quantite,
      dateEntree,
      dateExpiration,
      fournisseur,
    };

    axios
      .put(
        `http://localhost:8000/admin/Stock/ModifierProduit/${this.props.item._id}`,
        data,
        { withCredentials: true }
      )
      .then((res) => {
        const updatedItem = {
          _id: this.props.item._id,
          produit,
          prixUnitaire: parseFloat(prixUnitaire),
          quantite,
          dateEntree,
          dateExpiration,
          fournisseur,
        };

        this.setState({
          alertMessage: res.data.message || "Produit modifié",
          alertType: "success",
          isBlocking: true
        });

        if (this.props.onUpdateStock) {
          this.props.onUpdateStock(updatedItem);
        }
      })
      .catch((err) => {
        this.setState({
          alertMessage: err.response?.data?.message || "Erreur lors de la modification",
          alertType: "error",
          isBlocking: true
        });
      });
  };

  render() {
    const {
      produit,prixUnitaire, quantite, dateEntree,
      dateExpiration, fournisseur, alertMessage, alertType
    } = this.state;

    return (
      <div className="stock-modal-overlay">
        <div className="stock-modal">
          <h3>Modifier le produit</h3>

          {/* Alerte message de succes /error lors de la modification d'un produit*/}
          {alertMessage && (
            <div className={`advanced-alert ${alertType}`}>
              <div className="alert-content">
                <p>{alertMessage}</p>
              </div>
              <button className="alert-btn" onClick={() => this.setState({ alertMessage: "", alertType: "",isBlocking: false })}>
                OK
              </button>
            </div>
          )}

          <form onSubmit={this.handleSubmit}>
            <input type="text" name="produit" value={produit} onChange={this.handleChange} required placeholder="produit"/>
            <input type="number" name="prixUnitaire" value={prixUnitaire} onChange={this.handleChange} required placeholder="prixUnitaire unitaire" min="0" step="0.01"/>
            <input type="text" name="quantite" value={quantite} onChange={this.handleChange} required placeholder="Quantité"/>
            <input type="date" name="dateEntree" value={dateEntree} onChange={this.handleChange} required/>
            <input type="date" name="dateExpiration" value={dateExpiration} onChange={this.handleChange} required/>
            <input type="text" name="fournisseur" value={fournisseur} onChange={this.handleChange} required placeholder="fournisseur"/>

            <div className="modal-buttons">
              <button type="submit">Modifier</button>
              <button type="button" onClick={this.props.onClose}>✕ Fermer</button>
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

export default ModifyStockModal;
