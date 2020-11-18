import React from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import useUniqueId from "../commonComponents/useUniqueIds";

const TextInput = ({ label, type='text', ...inputProps }) => {
  const [newId] = useUniqueId("textinput", 1);
  const id = (inputProps.id || newId);
  const props = {id, type, ...inputProps};
  // merge in css classes
  props.className = classnames('usa-input', inputProps.className);
  const labelElem = label ? (
    <label className="usa-label" htmlFor={id}>
      {label}
    </label>
  ) : null;

  return (
    <React.Fragment>
      {labelElem}
      <input
        autoComplete="off"
        {...props}
      />
    </React.Fragment>
  );
};

TextInput.propTypes = {
  value: PropTypes.string,
  label: PropTypes.string,
  name: PropTypes.string,
  type: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
};

export default TextInput;
