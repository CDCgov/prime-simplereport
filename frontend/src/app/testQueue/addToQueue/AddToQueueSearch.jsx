import React, { useState } from "react";
import { useSelector } from "react-redux";

import { patientSearch } from "../testQueueSelectors";
import SearchInput from "./SearchInput";
import SearchResults from "./SearchResults";

const MIN_SEARCH_CHARACTER_COUNT = 3;

const AddToQueueSearchBox = () => {
  const [queryString, setQueryString] = useState("");
  const [suggestions, updateSuggestions] = useState([]);
  const allPatients = useSelector(patientSearch);

  let shouldShowSuggestions = queryString.length >= MIN_SEARCH_CHARACTER_COUNT;

  const getSuggestionsFromQueryString = (queryString) => {
    let formattedQueryString = queryString.toLowerCase();
    let suggestions = allPatients.filter((patient) => {
      console.log(
        patient.displayName.toLowerCase().indexOf(formattedQueryString)
      );
      return (
        patient.firstName.toLowerCase().indexOf(formattedQueryString) > -1 ||
        patient.middleName.toLowerCase().indexOf(formattedQueryString) > -1 ||
        patient.lastName.toLowerCase().indexOf(formattedQueryString) > -1 ||
        patient.displayName.toLowerCase().indexOf(formattedQueryString) > -1 ||
        patient.patientId.toLowerCase().indexOf(formattedQueryString) > -1
      );
    });
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
        onAddToQueue={() => {
          setQueryString("");
        }}
      />
    </React.Fragment>
  );
};

export default AddToQueueSearchBox;
