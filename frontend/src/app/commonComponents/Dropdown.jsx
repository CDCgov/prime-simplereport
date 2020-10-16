import React from "react";
import PropTypes from "prop-types";
import { v4 as uuidv4 } from "uuid";

const Dropdown = ({ options, label, name, onChange }) => {
  const optionsElements = options.map(({ value, text }) => (
    <option value={value}>{text}</option>
  ));

  const id = uuidv4();
  return (
    <React.Fragment>
      <label className="usa-label" htmlfor={id}>
        <strong>{label}</strong>
      </label>
      <select className="usa-select" name={name} id={id} onChange={onChange}>
        {optionsElements}
      </select>
    </React.Fragment>
  );
};

Dropdown.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      text: PropTypes.string,
      value: PropTypes.string,
    })
  ),
  label: PropTypes.string,
  name: PropTypes.string,
  onChange: PropTypes.string,
};

export default Dropdown;
