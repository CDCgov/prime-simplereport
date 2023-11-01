import React, {
  ChangeEventHandler,
  MouseEventHandler,
  useEffect,
  useRef,
} from "react";
import classnames from "classnames";

import iconSearch from "../../../img/search--white.svg";

type Props = {
  onSearchClick?: MouseEventHandler<HTMLButtonElement>;
  onInputChange: ChangeEventHandler<HTMLInputElement>;
  queryString: string;
  disabled?: boolean;
  className?: string;
  label?: string;
  placeholder?: string;
  focusOnMount?: boolean;
  showSubmitButton?: boolean;
  labeledBy?: string;
  dataCy?: string;
};

const SearchInput = ({
  onSearchClick,
  onInputChange,
  queryString,
  disabled = false,
  className,
  label,
  placeholder,
  focusOnMount,
  showSubmitButton = true,
  labeledBy,
  dataCy,
}: Props) => {
  const classes = classnames(
    "usa-search",
    "usa-search--small",
    "prime-search-input",
    "display-inline-block"
  );
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (focusOnMount && inputRef.current) {
      inputRef.current.focus();
    }
  }, [focusOnMount]);

  return (
    <div className={classnames("prime-search-container", className)}>
      <form className={classes} role="search">
        <label
          className={label ? "display-block" : "usa-sr-only"}
          htmlFor="search-field-small"
        >
          {label || placeholder || "Search"}
        </label>
        <div>
          <input
            autoComplete="off"
            className="usa-input"
            id="search-field-small"
            placeholder={placeholder}
            type="search"
            name="search"
            value={queryString}
            onChange={onInputChange}
            ref={inputRef}
            onFocus={onInputChange}
            aria-labelledby={labeledBy}
            style={!showSubmitButton ? { borderRight: "solid 1px" } : undefined}
            data-cy={dataCy}
          />
          <button
            type="submit"
            className="usa-button"
            disabled={disabled}
            onClick={onSearchClick}
            style={!showSubmitButton ? { display: "none" } : undefined}
          >
            <img
              src={iconSearch}
              className="usa-search__submit-icon"
              alt="Search"
            />
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchInput;
