import React from "react";

import Button from "../../commonComponents/Button";
import TextInput from "../../commonComponents/TextInput";

const SearchInput = ({
  onSearchClick,
  onInputChange,
  queryString,
  disabled,
}) => {
  return (
    <React.Fragment>
      <TextInput
        placeholder="Search by Unique Patient ID or Name"
        value={queryString}
        onChange={(e) => onInputChange(e)}
        name="add-to-queue-search"
        addClass="usa-input"
        autocomplete={false}
      />
      <Button
        type="submit"
        onClick={(e) => onSearchClick(e)}
        icon="search"
        disabled={disabled}
      />
    </React.Fragment>
  );
};

export default SearchInput;
