import React from "react";
import PropTypes from "prop-types";

import PatientList from "../patients/PatientList";
import { patientPropType } from "../propTypes";

const OrganizationHome = ({ patients }) => (
  <React.Fragment>
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
