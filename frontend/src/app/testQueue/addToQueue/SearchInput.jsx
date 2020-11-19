import React from "react";

const SearchInput = ({
  onSearchClick,
  onInputChange,
  queryString,
  disabled,
}) => {
  return (
    <form class="usa-search usa-search--small prime-search-input" role="search">
      <label class="usa-sr-only" for="search-field-small">
        Search
      </label>
      <input
        autocomplete="off"
        class="usa-input"
        id="search-field-small"
        type="search"
        name="search"
        value={queryString}
        onChange={onInputChange}
      />
      <button
        class="usa-button"
        type="submit"
        disabled={disabled}
        onClick={onSearchClick}
      >
        <span class="usa-sr-only">Search</span>
      </button>
    </form>
  );
};

export default SearchInput;
