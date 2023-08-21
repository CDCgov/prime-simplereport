import React from "react";
import { UseFormRegisterReturn } from "react-hook-form";

import Dropdown from "./Dropdown";

export type Option<T> = {
  label: string;
  value: T;
  disabled?: boolean;
};

interface Props<T> {
  options: Option<T>[];
  label?: string | React.ReactNode;
  name?: string;
  value: T;
  onChange?: (value: T) => void;
  onBlur?: () => void;
  defaultOption?: string;
  defaultSelect?: boolean;
  required?: boolean;
  validationStatus?: "error" | "success";
  errorMessage?: React.ReactNode;
  selectClassName?: string;
  disabled?: boolean;
  className?: string;
  registrationProps?: UseFormRegisterReturn<any>;
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
  defaultOption,
  defaultSelect,
  required,
  selectClassName,
  disabled,
  className,
  registrationProps,
}: Props<T>): React.ReactElement => {
  const onChangeWrapper = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange && onChange(e.target.value as T);
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
      defaultOption={defaultOption}
      defaultSelect={defaultSelect}
      selectClassName={selectClassName}
      disabled={disabled}
      className={className}
      registrationProps={registrationProps}
    />
  );
};

export default Select;
