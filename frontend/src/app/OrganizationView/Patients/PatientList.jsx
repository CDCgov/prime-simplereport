import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

import { displayFullName } from "../../utils";
import { patientPropType } from "../../propTypes";

const PatientList = ({ patients }) => {
  const location = useLocation();

  const patientRows = (patients) => {
    if (Object.keys(patients).length === 0) {
      return;
    }

    let rows = Object.entries(patients).map(([patientId, patient]) => (
      <tr key={`patient-${uuidv4()}`}>
        <th scope="row">
          {displayFullName(
            patient.firstName,
            patient.middleName,
            patient.lastName
          )}
        </th>
        <td>{patient.birthDate}</td>
        <td>{patient.address}</td>
        <td>{patient.phone}</td>
        <td>
          <Link to={`${location.pathname}/testResult/${patientId}`}>
            View Results
          </Link>
        </td>
      </tr>
    ));
    return rows;
  };

  let rows = patientRows(patients);

  return (
    <div className="prime-container">
      <h2> Scheduled Today </h2>

      <table className="usa-table usa-table--borderless">
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Date of Birth</th>
            <th scope="col">Address</th>
            <th scope="col">Phone Number</th>
            <th scope="col">Test Results</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    </div>
  );
};

PatientList.propTypes = {
  patients: PropTypes.objectOf(patientPropType),
};

export default PatientList;
