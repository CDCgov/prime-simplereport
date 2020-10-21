import React, { useState } from "react";
import Autosuggest from "react-autosuggest";
import { useSelector } from "react-redux";

import { patientSearch } from "../testQueueSelectors";
import SearchInput from "./SearchInput";
import SearchResults from "./SearchResults";

const MIN_SEARCH_CHARACTER_COUNT = 3;

const AddToQueueSearchBox = () => {
  const [queryString, updateQueryString] = useState("");
  const [suggestions, updateSuggestions] = useState([]);

  const allItems = useSelector(patientSearch);

  // determines which suggestions Autosuggest should show for a given input
  const getSuggestionsFromInput = (inputString) => {
    let formattedSearchQuery = inputString.trim().toLowerCase();
    let suggestions = allItems.filter(
      (patient) =>
        patient.name.toLowerCase().indexOf(formattedSearchQuery) > -1 ||
        patient.patientId.toLowerCase().indexOf(formattedSearchQuery) > -1
    );
    return suggestions;
  };

  // change event handler for new inputs
  const onChange = (e, { newValue }) => {
    updateQueryString(newValue);
  };

  // this is called whenever you need to update suggestions
  // ie: any onkeychange event on the input
  const onSuggestionsFetchRequested = ({ value }) => {
    updateSuggestions(getSuggestionsFromInput(value));
  };

  // populate the input based on the clicked suggestion
  // todo: this never gets called, presumably because suggestions are rendered  does nothing for some reason
  const getSuggestionValue = (suggestion) => {
    return suggestion.name;
  };

  const onSearchClick = (event, searchQuery) => {
    event.preventDefault();
    updateSuggestions(getSuggestionsFromInput(searchQuery));
  };

  let shouldShowSuggestions = queryString.length >= MIN_SEARCH_CHARACTER_COUNT;

  return (
    <React.Fragment>
      <Autosuggest
        suggestions={suggestions}
        onSuggestionsFetchRequested={onSuggestionsFetchRequested}
        getSuggestionValue={getSuggestionValue}
        alwaysRenderSuggestions={true}
        renderInputComponent={(inputProps) => (
          <SearchInput
            inputProps={inputProps}
            onClick={onSearchClick}
            queryString={queryString}
            disabled={!shouldShowSuggestions}
          />
        )}
        renderSuggestion={() => {}} // not used but is required. See renderSuggestionsContainer
        renderSuggestionsContainer={({ containerProps, children }) => {
          if (!shouldShowSuggestions) {
            return null;
          }
          if (!children) {
            return <h1>Sorry no results</h1>; // TODO: style me
          }

          // note: this is a hack
          // By default, this react-autosuggest renders suggestions as <li>{suggestion}</li>
          // to render results as a table, we need to override it using this method. This breaks things
          return (
            <SearchResults
              suggestions={children.props.items}
              containerProps={containerProps}
              clearQuery={() => updateQueryString("")}
            />
          );
        }}
        inputProps={{
          onChange: onChange,
          value: queryString,
          placeholder: "Search by Unique Patient ID, Name",
        }}
      />
    </React.Fragment>
  );
};

export default AddToQueueSearchBox;
