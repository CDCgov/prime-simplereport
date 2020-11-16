import React from "react";
import PropTypes from "prop-types";
import useUniqueIds from "../commonComponents/useUniqueIds";
import classnames from "classnames";

const Dropdown = ({
  options,
  label,
  name,
  onChange,
  disabled,
  addClass,
  defaultOption, // value of the default option
  selectedValue,
}) => {
  const [selectId] = useUniqueIds("dropdown", 1);

  return (
    <div className={classnames("prime-dropdown", addClass)}>
      <label className="usa-label" htmlFor={selectId}>
        {label}
      </label>
      <select
        className="usa-select"
        name={name}
        id={selectId}
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
    </div>
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
