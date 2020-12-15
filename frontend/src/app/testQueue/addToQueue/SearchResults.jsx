import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import PropTypes from "prop-types";

import Anchor from "../../commonComponents/Anchor";
import AoeModalForm from "../AoEForm/AoEModalForm";
import { displayFullName } from "../../utils";

const AddToQueueButton = ({ patient, onAddToQueue, facilityId }) => {
  const [aoeDialogActive, setAoEDialogActive] = useState(false);
  if (patient.isInQueue) {
    return "Already in queue";
  }
  const saveHandler = (answers) => {
    onAddToQueue(patient, answers);
  };
  return (
    <React.Fragment>
      <Anchor onClick={() => setAoEDialogActive(true)} text="Begin Test" />
      {aoeDialogActive && (
        <AoeModalForm
          saveButtonText="Continue"
          patient={patient}
          onClose={() => setAoEDialogActive(false)}
          saveCallback={saveHandler}
          facilityId={facilityId}
        />
      )}
    </React.Fragment>
  );
};

const SearchResults = ({
  suggestions,
  shouldDisplay,
  onAddToQueue,
  facilityId,
}) => {
  if (!shouldDisplay) {
    return null;
  }

  const renderResultsTable = () => {
    if (suggestions.length === 0) {
      return <h3> No results </h3>;
    }
    let suggestionRows = suggestions.map((suggestion) => (
      <tr key={uuidv4()}>
        <td>
          {displayFullName(
            suggestion.firstName,
            suggestion.middleName,
            suggestion.lastName
          )}
        </td>
        <td>{suggestion.birthDate}</td>
        <td>{suggestion.lookupId}</td>
        <td>
          <AddToQueueButton
            patient={suggestion}
            onAddToQueue={onAddToQueue}
            facilityId={facilityId}
          />
        </td>
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
    <div className="usa-card__container shadow-3 results-dropdown">
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
