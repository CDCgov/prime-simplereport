import React, {
  ChangeEventHandler,
  MouseEventHandler,
  useEffect,
  useRef,
} from "react";
import classnames from "classnames";

type Props = {
  onSearchClick: MouseEventHandler<HTMLButtonElement>;
  onInputChange: ChangeEventHandler<HTMLInputElement>;
  queryString: string;
  disabled?: boolean;
  className?: string;
  label?: string;
  placeholder?: string;
  focusOnMount?: boolean;
  showSubmitButton?: boolean;
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
          {label || "Search"}
        </label>
        <div>
          <input
            autoComplete="off"
            className="usa-input"
            id="search-field-small"
            placeholder={
              placeholder !== undefined
                ? placeholder
                : "Search for a person to start their test"
            }
            type="search"
            name="search"
            value={queryString}
            onChange={onInputChange}
            ref={inputRef}
            onFocus={onInputChange}
          />
          {showSubmitButton && (
            <button
              type="submit"
              className="usa-button"
              disabled={disabled}
              onClick={onSearchClick}
            >
              <span className="usa-sr-only">Search</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default SearchInput;
