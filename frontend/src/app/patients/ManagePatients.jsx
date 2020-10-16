import React from "react";

import Button from "../common/components/Button";
import TextInput from "../common/components/TextInput";

const ManagePatients = () => {
  return (
    <main className="prime-home">
      <div className="grid-container">
        <div className="prime-container">
          <h1> Add New Patients</h1>
          <Button type="button" onClick={() => {}} label="New Patient" />
          <Button type="button" onClick={() => {}} label="CSV Upload" />
        </div>
      </div>
    </main>
  );
};

export default ManagePatients;
