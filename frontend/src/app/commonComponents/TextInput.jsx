import React from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import useUniqueId from "../commonComponents/useUniqueIds";

const TextInput = ({
  value = "",
  label,
  name,
  placeholder,
  onChange,
  type,
  addClass,
}) => {
  let [newId] = useUniqueId("textinput", 1);

  const labelElem = label ? (
    <label className="usa-label" htmlFor={newId}>
      {label}
    </label>
  ) : null;

  return (
    <div className={classnames("prime-text-input", addClass)}>
      {labelElem}
      <input
        autoComplete="off"
        className="usa-input"
        id={newId}
        name={name}
        type={type || "text"}
        onChange={onChange}
        placeholder={placeholder}
        value={value ?? ""}
      />
    </div>
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
