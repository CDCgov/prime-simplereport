import React from "react";

import Dropdown from "./Dropdown";

type Option<T> = {
  label: string;
  value: T;
  disabled?: boolean;
};

interface Props<T> {
  options: Option<T>[];
  label?: string;
  name?: string;
  value: T;
  onChange: (value: T) => void;
  onBlur?: () => void;
  defaultSelect?: boolean;
  required?: boolean;
  validationStatus?: "error" | "success";
  errorMessage?: React.ReactNode;
}

const Select = <T extends string>({
  name,
  label,
  value,
  onChange,
  options,
  onBlur,
  validationStatus,
  errorMessage,
  defaultSelect,
  required,
}: Props<T>): React.ReactElement => {
  const onChangeWrapper = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value as T);
  };
  return (
    <Dropdown
      label={label}
      name={name}
      selectedValue={value}
      options={options}
      onChange={onChangeWrapper}
      onBlur={onBlur}
      validationStatus={validationStatus}
      errorMessage={errorMessage}
      required={required}
      defaultSelect={defaultSelect}
    />
  );
};

export default Select;
