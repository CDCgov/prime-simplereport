import React from "react";
import { Link } from "react-router-dom";

const Admin = () => {
  return (
    <main className="prime-home">
      <div className="grid-container">
        <div className="grid-row">
          <div className="prime-container usa-card__container">
            <div className="usa-card__header">
              <div>
                <h2>Admin</h2>
              </div>
            </div>
            <div className="usa-card__body">
              <Link to="/admin/create-organization">
                Create new organization
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Admin;
