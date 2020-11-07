import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";

import { getAllPatientsWithQueueStatus } from "../testQueueSelectors";
import SearchInput from "./SearchInput";
import SearchResults from "./SearchResults";
import { addPatientToQueue } from "../state/testQueueActions";
import { toast } from "react-toastify";

import Alert from "../../commonComponents/Alert";
import { QUEUE_NOTIFICATION_TYPES, ALERT_CONTENT } from "../constants";

const MIN_SEARCH_CHARACTER_COUNT = 3;

const AddToQueueSearchBox = () => {
  const dispatch = useDispatch();
  const [queryString, setQueryString] = useState("");
  const [suggestions, updateSuggestions] = useState([]);
  const allPatients = useSelector(getAllPatientsWithQueueStatus);

  let shouldShowSuggestions = queryString.length >= MIN_SEARCH_CHARACTER_COUNT;

  const getSuggestionsFromQueryString = (queryString) => {
    let formattedQueryString = queryString.toLowerCase();
    let suggestions = allPatients.filter(
      (patient) =>
        patient.displayName.toLowerCase().indexOf(formattedQueryString) > -1 ||
        patient.patientId.toLowerCase().indexOf(formattedQueryString) > -1
    );
    return suggestions;
  };

  const onInputChange = (event) => {
    let newValue = event.target.value;
    setQueryString(newValue);
    if (newValue.length > 2) {
      updateSuggestions(getSuggestionsFromQueryString(newValue));
    }
  };

  const onSearchClick = (event) => {
    event.preventDefault();
    updateSuggestions(getSuggestionsFromQueryString(queryString));
  };

  let alert = null;
  const onAddToQueue = (patient) => {
    setQueryString("");
    dispatch(addPatientToQueue(patient));

    let { type, title, body } = {
      ...ALERT_CONTENT[QUEUE_NOTIFICATION_TYPES.ADDED_TO_QUEUE__SUCCESS](
        patient
      ),
    };
    toast.dismiss(); // removes any existing toasts
    toast(<Alert type={type} title={title} body={body} />);
  };

  return (
    <React.Fragment>
      <SearchInput
        onSearchClick={onSearchClick}
        onInputChange={onInputChange}
        queryString={queryString}
        disabled={!shouldShowSuggestions}
      />
      <SearchResults
        suggestions={suggestions}
        shouldDisplay={shouldShowSuggestions}
        onAddToQueue={onAddToQueue}
      />
    </React.Fragment>
  );
};

export default AddToQueueSearchBox;
