import React from "react";
import PropTypes from "prop-types";

import PatientManagementNav from "./Patients/PatientManagementNav";
import PatientList from "./Patients/PatientList";
import { patientPropType } from "../propTypes";

const OrganizationHome = ({ patients }) => (
  <React.Fragment>
    <PatientManagementNav />

    <main className="prime-home">
      <div className="grid-container">
        <div className="grid-row">
          <PatientList patients={patients} />
        </div>
      </div>
    </main>
  </React.Fragment>
);

OrganizationHome.propTypes = {
  patients: PropTypes.objectOf(patientPropType),
};

export default OrganizationHome;
