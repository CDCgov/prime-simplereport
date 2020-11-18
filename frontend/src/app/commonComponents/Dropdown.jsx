import React from "react";
import PropTypes from "prop-types";
import useUniqueIds from "../commonComponents/useUniqueIds";
// import classnames from "classnames";

const Dropdown = ({
  options,
  label,
  name,
  onChange,
  disabled,
  // addClass,
  id,
  defaultOption, // value of the default option
  selectedValue,
}) => {
  const [selectId] = useUniqueIds("dropdown", 1);
  const elemId = id || selectId;

  const labelElem = label ? (
    <label className="usa-label" htmlFor={elemId}>
      <strong>{label}</strong>
    </label>
  ) : null;

  return (
    <React.Fragment>
      {labelElem}
      <select
        className="usa-select"
        name={name}
        id={elemId}
        onChange={onChange}
        value={selectedValue || defaultOption || ""}
        disabled={disabled}
      >
        <option value={null}>- Select -</option>
        {options.map(({ value, label }, i) => (
          <option key={value + i} value={value}>
            {label}
          </option>
        ))}
      </select>
    </React.Fragment>
  );
};

Dropdown.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.string,
    })
  ),
  label: PropTypes.string,
  name: PropTypes.string,
  onChange: PropTypes.func,
  selectedValue: PropTypes.string,
  disabled: PropTypes.bool,
  defaultOption: PropTypes.bool,
};

export default Dropdown;
