import React from "react";
import useUniqueIds from "./useUniqueIds";
import classnames from "classnames";

interface Option {
  label: string;
  value: string;
  disabled?: boolean;
}

interface Props {
  options: Option[];
  label?: string;
  name?: string;
  onChange: (e: React.FormEvent<HTMLSelectElement>) => void;
  selectedValue: string;
  disabled?: boolean;
  defaultOption?: string;
  addClass?: string;
}

const Dropdown: React.FC<Props> = ({
  options,
  label,
  name,
  onChange,
  disabled,
  addClass = "",
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
        <option value={undefined}>- Select -</option>
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
