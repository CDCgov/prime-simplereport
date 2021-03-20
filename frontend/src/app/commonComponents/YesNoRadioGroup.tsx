import React from "react";

import { YES_NO_VALUES } from "../constants";

import RadioGroup from "./RadioGroup";

interface Props {
  name: string;
  legend: React.ReactNode;
  value: boolean | null;
  onChange: (value: boolean) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  validationStatus?: "error" | "success";
  errorMessage?: React.ReactNode;
  required?: boolean;
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
}) => (
  <RadioGroup
    legend={legend}
    name={name}
    buttons={YES_NO_VALUES}
    selectedRadio={value === true ? "YES" : value === false ? "NO" : null}
    onChange={(value) => onChange(value === "YES")}
    onBlur={onBlur}
    validationStatus={validationStatus}
    errorMessage={errorMessage}
    required={required}
  />
);

export default YesNoRadioGroup;
