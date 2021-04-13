import React from "react";

import { YES_NO_UNKNOWN_VALUES, YES_NO_VALUES } from "../constants";

import RadioGroup from "./RadioGroup";

interface Props {
  name: string;
  legend: React.ReactNode;
  value: YesNoUnknown | undefined;
  onChange: (value: YesNoUnknown) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  validationStatus?: "error" | "success";
  errorMessage?: React.ReactNode;
  required?: boolean;
  showUnknown?: boolean;
}

const YesNoRadioGroup: React.FC<Props> = ({
  name,
  legend,
  value,
  onChange,
  onBlur,
  validationStatus,
  errorMessage,
  required,
  showUnknown,
}) => {
  const values = showUnknown ? YES_NO_UNKNOWN_VALUES : YES_NO_VALUES;

  return (
    <RadioGroup
      legend={legend}
      name={name}
      buttons={values}
      selectedRadio={value}
      onChange={onChange}
      onBlur={onBlur}
      validationStatus={validationStatus}
      errorMessage={errorMessage}
      required={required}
    />
  );
};

export default YesNoRadioGroup;
