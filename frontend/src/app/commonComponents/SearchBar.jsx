import React, { useState } from "react";
import PropTypes from "prop-types";
import TextInput from "./TextInput";
import Button from "./Button";

const SearchBar = ({ onSearchClick }) => {
  const [queryString, updateQueryString] = useState("");

  return (
    <form role="search">
      <TextInput
        placeholder="Search by Unique Patient ID, Name, or Date of Birth"
        value={queryString}
        onChange={(e) => updateQueryString(e.target.value)}
        name="patient-search"
        addClass="usa-input"
      />
      <Button
        type="submit"
        onClick={(e) => onSearchClick(e, queryString)}
        icon="search"
      />
    </form>
  );
};

SearchBar.propTypes = {
  onSearchClick: PropTypes.func,
};

export default SearchBar;
