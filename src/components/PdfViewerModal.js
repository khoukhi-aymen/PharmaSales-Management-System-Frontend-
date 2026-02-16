import React, { Component } from "react";
import { FiX } from "react-icons/fi";

class PdfViewerModal extends Component {
  render() {
    const { pdfUrl, onClose } = this.props;

    return (
      <div
        className="pdf-modal-overlay"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 9999,
        }}
      >
        <div
          className="pdf-modal-content"
          style={{
            width: "92%",          // prend toute la largeur
            height: "92%",         // prend toute la hauteur
            backgroundColor: "#fff",
            borderRadius: "0",      // coins droits si tu veux tout écran
            boxShadow: "0 5px 20px rgba(0,0,0,0.3)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {/* Header du modal */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px 20px",
              backgroundColor: "#1E90FF",
              color: "white",
            }}
          >
            <h3 style={{ margin: 0 }}>Visualiser le PDF</h3>
            <button
              onClick={onClose}
              style={{
                background: "transparent",
                border: "none",
                color: "white",
                cursor: "pointer",
                fontSize: "1.2rem",
              }}
            >
              <FiX />
            </button>
          </div>

          {/* Contenu PDF */}
          <iframe
            src={pdfUrl}
            title="PDF Viewer"
            style={{ flex: 1, border: "none", width: "100%", height: "100%" }}
          ></iframe>
        </div>
      </div>
    );
  }
}

export default PdfViewerModal;
