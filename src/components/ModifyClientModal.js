import React, { Component } from "react";
import axios from "../Config/axiosConfig";

const CLIENT_CATEGORIES = [
  { label: "B2B", value: "B0000" },
  { label: "E-commerce", value: "E0000" },
  { label: "Fidèle", value: "F0000" },
  { label: "Distribution", value: "D0000" }
];

const SUPPLIER_CATEGORY = {
  label: "Fournisseur",
  value: "S0000"
};

class ModifyClientModal extends Component {
    constructor(props) {
        super(props);

        const c = props.item || {};

        this.state = {
            client: {
                ...c,
                barcode: this.getCategoryFromBarcode(c.barcode)
            },
           

            isClient: c.type?.includes("CLIENT") || false,
            isSupplier: c.type === "SUPPLIER" || false,

            activeTab: "general",
            alertMessage: "",
            alertType: "",
            isBlocking: false
        };
    }


    getAvailableCategories = () => {
        const { isClient, isSupplier } = this.state;

        if (isClient) {
            return CLIENT_CATEGORIES;
        }

        if (isSupplier) {
            return [SUPPLIER_CATEGORY];
        }

        return [];
    };

    getCategoryFromBarcode = (barcode) => {
        if (!barcode) return "";

        const prefix = barcode.charAt(0);

        const map = {
            B: "B0000",
            E: "E0000",
            F: "F0000",
            D: "D0000",
            S: "S0000"
        };

        return map[prefix] || "";
    };

    componentDidUpdate(prevProps) {
        if (prevProps.item !== this.props.item) {
            const c = this.props.item || {};

            this.setState({
                client: {
                    ...c,
                    barcode: this.getCategoryFromBarcode(c.barcode)
                },
                isClient: c.type?.includes("CLIENT"),
                isSupplier: c.type === "SUPPLIER"
            });
        }
    }

    handleChange = (e) => {
        const { name, value } = e.target;

        this.setState((prev) => ({
            client: {
                ...prev.client,
                [name]: value
            }
        }));
    };

    handleCheckboxChange = (e) => {
        const { name, checked } = e.target;

        this.setState((prevState) => {
            const newState = {
                ...prevState,
                [name]: checked
            };

            let newBarcode = (prevState.client.barcode || "").substring(0, 5);

            //CAS FOURNISSEUR SEUL
            if (!newState.isClient && newState.isSupplier) {
                newBarcode = SUPPLIER_CATEGORY.value;
            }

            // CAS CLIENT
            else if (newState.isClient) {
                const available = CLIENT_CATEGORIES;
                const isValid = available.some(cat => cat.value === newBarcode);

                if (!isValid) newBarcode = "";
            }

            // rien coché
            else {
                newBarcode = "";
            }

            return {
                ...newState,
                client: {
                    ...prevState.client,
                    barcode: newBarcode
                }
            };
        });
    };

    handleSubmit = (e) => {
        e.preventDefault();

        if (!this.state.isClient && !this.state.isSupplier) {
            this.setState({
                alertMessage: "Choisir au moins un type",
                alertType: "error"
            });
            return;
        }

        let type = "";
        if (this.state.isClient && this.state.isSupplier)
            type = "CLIENT,SUPPLIER";
        else if (this.state.isClient)
            type = "CLIENT";
        else
            type = "SUPPLIER";

        const data = {
            ...this.state.client,
            type,
            categoryCode: this.state.client.barcode
        };

        axios.post(
            `http://localhost:8000/biztrack/Tier/Actif/Modifier/${this.props.item._id}`,
            data,
            { withCredentials: true }
        )
            .then((res) => {
                this.setState({
                    alertMessage: res.data.message || "Client modifié",
                    alertType: "success",
                    isBlocking: true
                });

                // IMPORTANT : utiliser réponse backend
                this.props.onUpdateClient(res.data.data);
            })
            .catch(() => {
                this.setState({
                    alertMessage: "Erreur modification",
                    alertType: "error",
                    isBlocking: true
                });
            });
    };


    render() {
        const c = this.state.client;

        return (
            <div className="update-modal-overlay">
                <div className="update-modal">

                    <h3>Modifier Client / Fournisseur</h3>

                    {/* ALERT */}
                    {this.state.alertMessage && (
                        <div className={`advanced-alert ${this.state.alertType}`}>
                            <span>{this.state.alertMessage}</span>
                            <button
                                className="alert-btn"
                                style={{ marginLeft: "10px" }}
                                onClick={() => {

                                    this.setState({
                                        alertMessage: "",
                                        alertType: "",
                                        isBlocking: false
                                    });

                                    // fermer modal
                                    this.props.onClose();

                                    // recharger parent
                                    this.props.onRefresh();
                                }}
                            >
                                OK
                            </button>
                        </div>
                    )}

                    {/*NAVBAR TABS */}
                    <div className="update-tabs">
                        <button
                            className={this.state.activeTab === "general" ? "active" : ""}
                            onClick={() => this.setState({ activeTab: "general" })}
                            type="button"
                        >
                            Données
                        </button>

                        <button
                            className={this.state.activeTab === "contact" ? "active" : ""}
                            onClick={() => this.setState({ activeTab: "contact" })}
                            type="button"
                        >
                            Contacts
                        </button>

                        <button
                            className={this.state.activeTab === "location" ? "active" : ""}
                            onClick={() => this.setState({ activeTab: "location" })}
                            type="button"
                        >
                            Localisation
                        </button>
                    </div>

                    <form onSubmit={this.handleSubmit}>

                        {/* ===== DONNEES ===== */}
                        {this.state.activeTab === "general" && (
                            <div className="update-section">
                                <div className="update-grid">
                                    <input
                                        name="name"
                                        value={c.name || ""}
                                        onChange={this.handleChange}
                                        placeholder="Nom"
                                    />
                                    {this.state.isSupplier && !this.state.isClient ? (

                                        // FOURNISSEUR → PAS DE SELECT
                                        <input
                                            value="Fournisseur"
                                            disabled
                                        />

                                    ) : (

                                        // CLIENT → SELECT NORMAL
                                            <select
                                                name="barcode"
                                                value={c.barcode || ""}
                                                onChange={this.handleChange}
                                            >
                                                <option value="">-- Type de client --</option>

                                                {CLIENT_CATEGORIES.map((cat) => (
                                                    <option key={cat.value} value={cat.value}>
                                                        {cat.label}
                                                    </option>
                                                ))}
                                            </select>

                                    )}
                                    <input
                                        name="numero_c"
                                        value={c.numero_c || ""}
                                        onChange={this.handleChange}
                                        placeholder="Num fiscal / RC"
                                    />
                                </div>

                                <div style={{ marginTop: "10px" }}>
                                    <label>
                                        <input type="checkbox" name="isClient" checked={this.state.isClient || false} onChange={this.handleCheckboxChange} />
                                        Client
                                    </label>

                                    <label style={{ marginLeft: "15px" }}>
                                        <input type="checkbox" name="isSupplier" checked={this.state.isSupplier || false} onChange={this.handleCheckboxChange} />
                                        Fournisseur
                                    </label>
                                </div>
                            </div>
                        )}

                        {/* ===== CONTACT ===== */}
                        {this.state.activeTab === "contact" && (
                            <div className="update-section">
                                <div className="update-grid">
                                    <input
                                        name="phone"
                                        value={c.phone || ""}
                                        onChange={this.handleChange}
                                        placeholder="Téléphone"
                                    />

                                    <input
                                        name="mobile"
                                        value={c.mobile || ""}
                                        onChange={this.handleChange}
                                        placeholder="Mobile"
                                    />

                                    <input
                                        name="email"
                                        value={c.email || ""}
                                        onChange={this.handleChange}
                                        placeholder="Email"
                                    />
                                </div>
                            </div>
                        )}

                        {/* ===== LOCALISATION ===== */}
                        {this.state.activeTab === "location" && (
                            <div className="update-section">
                                <div className="update-grid">
                                    <input
                                        name="city"
                                        value={c.city || ""}
                                        onChange={this.handleChange}
                                        placeholder="Ville"
                                    />

                                    <input
                                        name="address"
                                        value={c.address || ""}
                                        onChange={this.handleChange}
                                        placeholder="Adresse"
                                    />
                                </div>
                            </div>
                        )}

                        {/* BUTTONS */}
                        <div className="update-buttons">
                            <button type="submit" className="update-save">Sauvegarder</button>
                            <button type="button" className="update-close" onClick={this.props.onClose}>
                                Fermer
                            </button>
                        </div>

                    </form>

                    {this.state.isBlocking && <div className="blocking-overlay"></div>}
                </div>
            </div>
        );
    }
}

export default ModifyClientModal;