import React from "react";

import Button from "../../commonComponents/Button";
import TextInput from "../../commonComponents/TextInput";

import { PATIENT_TERM_CAP } from "../../../config/constants";

const SearchInput = ({
  onSearchClick,
  onInputChange,
  queryString,
  disabled,
}) => {
  return (
    <React.Fragment>
      <TextInput
        placeholder={"Search by Unique " + PATIENT_TERM_CAP + "ID or Name"}
        value={queryString}
        onChange={(e) => onInputChange(e)}
        name="add-to-queue-search"
        addClass="usa-input"
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
