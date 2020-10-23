import React from "react";
import PropTypes from "prop-types";
import { v4 as uuidv4 } from "uuid";

const Dropdown = ({ options, label, name, onChange, selectedValue }) => {
  const optionsElements = options.map(({ value, label }) => (
    <option key={`dropdown-${uuidv4()}`} value={value}>
      {label}
    </option>
  ));

  const id = uuidv4();
  return (
    <React.Fragment>
      <label className="usa-label" htmlFor={id}>
        <strong>{label}</strong>
      </label>
      <select
        className="usa-select"
        name={id}
        id={id}
        name={name}
        onChange={onChange}
        value={selectedValue || ""}
      >
        {optionsElements}
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
};

export default Dropdown;
