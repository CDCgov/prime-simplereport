import React from "react";
import PropTypes from "prop-types";
import { v4 as uuidv4 } from "uuid";

const TextInput = ({ value, label, name, placeholder, onChange }) => {
  let newId = uuidv4();
  return (
    <React.Fragment>
      <label className="usa-label" htmlFor={newId}>
        {label}
      </label>
      <input
        className="usa-input"
        id={newId}
        name={name}
        type="text"
        onChange={onChange}
        placeholder={placeholder}
      ></input>
    </React.Fragment>
  );
};

TextInput.propTypes = {
  value: PropTypes.string,
  label: PropTypes.string,
  name: PropTypes.string,
  placeholder: PropTypes.string,
  onChange: PropTypes.func,
};

export default TextInput;
