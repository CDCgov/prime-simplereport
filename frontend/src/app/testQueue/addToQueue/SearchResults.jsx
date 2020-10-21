import React from "react";
import { v4 as uuidv4 } from "uuid";
import { useDispatch } from "react-redux";

import { addPatientToQueue } from "../state/testQueueActions";

const SearchResults = ({ containerProps, suggestions, clearQuery }) => {
  const dispatch = useDispatch();

  const addToQueueButton = (patient) =>
    patient.isInQueue ? (
      "Already in queue"
    ) : (
      <a
        href="#"
        onClick={() => {
          dispatch(addPatientToQueue(patient.patientId));
          clearQuery();
        }}
      >
        Add to Queue
      </a>
    );

  const renderedSuggestion = suggestions.map((suggestion) => (
    <tr key={uuidv4()}>
      <td>{suggestion.name}</td>
      <td>{suggestion.birthDate}</td>
      <td>{suggestion.patientId}</td>
      <td>{addToQueueButton(suggestion)}</td>
    </tr>
  ));

  // let suggestions = suggestions.map((suggestion) =>
  //   renderSuggestion(suggestion)
  // );
  return (
    <table {...containerProps} className="usa-table usa-table--borderless">
      <thead>
        <tr>
          <th scope="col">Full name</th>
          <th scope="col">Date of Birth</th>
          <th scope="col">Unique ID</th>
          <th scope="col">Actions</th>
        </tr>
      </thead>
      <tbody>{renderedSuggestion}</tbody>
    </table>
  );
};

export default SearchResults;
