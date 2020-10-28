import React from "react";
import { v4 as uuidv4 } from "uuid";
import { useDispatch } from "react-redux";
import PropTypes from "prop-types";

import Anchor from "../../commonComponents/Anchor";
import { addPatientToQueue } from "../state/testQueueActions";

const SearchResults = ({ suggestions, shouldDisplay, onAddToQueue }) => {
  const dispatch = useDispatch();

  if (!shouldDisplay) {
    return null;
  }

  const addToQueueButton = (patient) =>
    patient.isInQueue ? (
      "Already in queue"
    ) : (
      <Anchor
        onClick={() => {
          dispatch(addPatientToQueue(patient.patientId));
          onAddToQueue();
        }}
        text="Add to Queue"
      />
    );

  const renderResultsTable = () => {
    if (suggestions.length === 0) {
      return <h3> No results </h3>;
    }
    let suggestionRows = suggestions.map((suggestion) => (
      <tr key={uuidv4()}>
        <td>{suggestion.displayName}</td>
        <td>{suggestion.birthDate}</td>
        <td>{suggestion.patientId}</td>
        <td>{addToQueueButton(suggestion)}</td>
      </tr>
    ));
    return (
      <table className="usa-table usa-table--borderless">
        <thead>
          <tr>
            <th scope="col">Full name</th>
            <th scope="col">Date of Birth</th>
            <th scope="col">Unique ID</th>
            <th scope="col">Actions</th>
          </tr>
        </thead>
        <tbody>{suggestionRows}</tbody>
      </table>
    );
  };

  return (
    <div className="usa-card__container">
      <div className="usa-card__body">{renderResultsTable()}</div>
    </div>
  );
};

SearchResults.propTypes = {
  suggestions: PropTypes.arrayOf(PropTypes.any), // TODO: once this stabilizes define what `any` means
  shouldDisplay: PropTypes.bool,
  onAddToQueu: PropTypes.func,
};

export default SearchResults;
