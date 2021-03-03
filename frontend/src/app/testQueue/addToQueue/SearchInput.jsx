import React from "react";

const SearchInput = ({
  onSearchClick,
  onInputChange,
  queryString,
  disabled,
}) => {
  return (
    <form
      className="usa-search usa-search--small prime-search-input"
      role="search"
    >
      <label className="usa-sr-only" htmlFor="search-field-small">
        Search
      </label>
      <input
        autoComplete="off"
        className="usa-input"
        id="search-field-small"
        placeholder="Search for a person to start their test"
        type="search"
        name="search"
        value={queryString}
        onChange={onInputChange}
      />
      <button
        type="submit"
        className="usa-button"
        disabled={disabled}
        onClick={onSearchClick}
      >
        <span className="usa-sr-only">Search</span>
      </button>
    </form>
  );
};

export default SearchInput;
