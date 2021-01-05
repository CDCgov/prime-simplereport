import React from "react";
import useUniqueIds from "./useUniqueIds";
import classnames from "classnames";

import Required from "../commonComponents/Required";

interface Option {
  label: string;
  value: string;
  disabled?: boolean;
}

interface Props {
  options: Option[];
  label?: string;
  name?: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  selectedValue: string;
  disabled?: boolean;
  defaultOption?: string;
  className?: string;
  defaultSelect?: boolean;
  required?: boolean;
  errorMessage?: React.ReactNode;
  validationStatus?: "error" | "success";
}

const Dropdown: React.FC<Props> = ({
  options,
  label,
  name,
  onChange,
  disabled,
  className,
  defaultOption, // value of the default option
  selectedValue,
  defaultSelect,
  required,
  validationStatus,
  errorMessage,
}) => {
  const [selectId] = useUniqueIds("drop", 1);

  return (
    <div
      className={classnames(
        "usa-form-group prime-dropdown ",
        validationStatus === "error" && "usa-form-group--error",
        className
      )}
    >
      {label && (
        <label className="usa-label" htmlFor={selectId}>
          {required ? <Required label={label} /> : label}
        </label>
      )}
      {validationStatus === "error" && (
        <div role="alert" className="usa-error-message">
          {errorMessage}
        </div>
      )}
      <select
        className="usa-select"
        name={name}
        id={selectId}
        onChange={onChange}
        value={selectedValue || defaultOption || ""}
        disabled={disabled}
      >
        {defaultSelect && <option value={undefined}>- Select -</option>}
        {options.map(({ value, label, disabled }, i) => (
          <option key={value + i} value={value} disabled={disabled}>
            {label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Dropdown;
