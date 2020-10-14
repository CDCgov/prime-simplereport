import React, { useState } from "react";
import { Link, useLocation, useHistory } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { v4 as uuidv4 } from "uuid";

// import RadioGroup from "../common/components/RadioGroup";
import Button from "../common/components/Button";
import { testResultPropType } from "../propTypes";
// import { COVID_RESULTS } from "../constants";
import { useSelector } from "react-redux";
import { getPatients } from "../patients/selectors";
import LabeledText from "../common/components/LabeledText";
import SearchBar from "../common/components/SearchBar";
import { searchPatients } from "../query/patients";
import { displayFullName } from "../utils";

const AddToQueue = () => {
  const patients = useSelector(getPatients); // TODO: only get patients in the queue
  const location = useLocation();
  let history = useHistory();

  const [patientSearchResults, updatePatientSearchResults] = useState([]);

  const onSearchClick = (event, searchQuery) => {
    event.preventDefault();
    let searchResults = searchPatients(searchQuery);
    updatePatientSearchResults(searchResults);
  };

  const renderSearchResults = () => {
    if (patientSearchResults.length === 0) {
      return null;
    }
    let rows = patientSearchResults.map((patient) => (
      <tr key={`patient-${uuidv4()}`}>
        <th scope="row">
          {displayFullName(
            patient.firstName,
            patient.middleName,
            patient.lastName
          )}
        </th>
        <td>{patient.patientId}</td>
        <td>{patient.birthDate}</td>
        <td>
          <Link to={`${location.pathname}/testResult/${patient.patientId}`}>
            Add to Queue
          </Link>
        </td>
      </tr>
    ));
    return (
      <React.Fragment>
        <h1> Results: </h1>
        <table className="usa-table usa-table--borderless">
          <thead>
            <tr>
              <th scope="col">Full Name</th>
              <th scope="col">Unique ID</th>
              <th scope="col">Date of Birth</th>
              <th scope="col">Actions</th>
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </table>
      </React.Fragment>
    );
  };

  return (
    <main className="prime-home">
      <div className="grid-container">
        <div className="grid-row">
          <div className="grid-col">
            <Button
              icon="arrow-left"
              type="button"
              onClick={() => history.goBack()}
              label="  Go Back"
            />
            <div className="prime-container">
              <SearchBar onSearchClick={onSearchClick} />
              {renderSearchResults()}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default AddToQueue;
