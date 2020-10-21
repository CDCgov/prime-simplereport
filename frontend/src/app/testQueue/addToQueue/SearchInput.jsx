import React from "react";
import { v4 as uuidv4 } from "uuid";

import Button from "../../commonComponents/Button";

const SearchInput = ({ inputProps, onClick, queryString, disabled }) => {
  return (
    <React.Fragment>
      <input
        {...inputProps}
        className="usa-input"
        id={`search-${uuidv4()}`}
        type="text"
      />
      <Button
        type="submit"
        onClick={(e) => onClick(e, queryString)}
        icon="search"
        disabled={disabled}
      />
    </React.Fragment>
  );
};

export default SearchInput;
