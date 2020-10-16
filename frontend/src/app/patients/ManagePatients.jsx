import React from "react";

import Button from "../commonComponents/Button";

const ManagePatients = () => {
  return (
    <main className="prime-home">
      <div className="grid-container">
        <div className="prime-container">
          <h1> Add New Patients</h1>
          <Button type="button" onClick={() => {}} label="New Patient" />
          <Button type="button" onClick={() => {}} label="Bulk Upload" />
        </div>
      </div>
    </main>
  );
};

export default ManagePatients;
