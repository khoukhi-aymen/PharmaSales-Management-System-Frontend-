import React, { Component } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/SideBar";
import FooterAdmin from "../components/FooterAdmin";

class AdminInterface extends Component {
  render() {
    return (
      <div className="admin-layout">
        {/* Sidebar */}
        <AdminSidebar />

        {/* Contenu principal */}
        <div className="admin-main">
          <div className="admin-content">
            <Outlet />
          </div>
          <FooterAdmin />
        </div>
      </div>
    );
  }
}

export default AdminInterface;
