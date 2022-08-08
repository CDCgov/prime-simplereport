import React, { useEffect, useState } from "react";

import TextInput, { HTMLInputElementType } from "./TextInput";

interface Props<T> {
  idString?: string;
  field: keyof T;
  formObject: T;
  label: string | React.ReactNode;
  className?: string;
  onChange: (field: keyof T) => (value: string) => void;
  validate: (field: keyof T) => Promise<void>;
  getValidationStatus: (name: keyof T) => "error" | undefined;
  errors: Partial<Record<keyof T, string>>;
  type?: HTMLInputElementType;
  required?: boolean;
  disabled?: boolean;
  hintText?: string;
  min?: number | string;
  max?: number | string;
}

export const Input = <T extends { [key: string]: any }>({
  field,
  idString,
  formObject,
  label,
  className,
  onChange,
  validate,
  getValidationStatus,
  errors,
  type,
  required,
  disabled,
  hintText,
  min,
  max,
}: Props<T>): React.ReactElement => {
  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(field)(e.target.value);
  };

  const [inputErrors, setErrors] = useState(errors);

  useEffect(() => {
    setErrors(errors);
  }, [errors]);

  return (
    <TextInput
      idString={idString}
      label={label}
      name={String(field)}
      value={formObject[field] || ""}
      onChange={onChangeHandler}
      onBlur={() => {
        validate(field);
      }}
      validationStatus={getValidationStatus(field)}
      errorMessage={inputErrors[field]}
      className={className}
      type={type}
      required={required}
      disabled={disabled}
      min={min}
      max={max}
      hintText={hintText}
    />
  );
};

export default Input;
