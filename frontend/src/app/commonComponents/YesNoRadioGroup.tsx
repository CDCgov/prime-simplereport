import React from "react";

import { YES_NO_VALUES } from "../constants";

import RadioGroup from "./RadioGroup";

interface Props {
  name: string;
  legend: React.ReactNode;
  value: boolean | null;
  hintText?: string;
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
  hintText,
  onChange,
  onBlur,
  validationStatus,
  errorMessage,
  required,
}) => {
  const getSelectedRadio = (): YesNo | null => {
    switch (value) {
      case true:
        return "YES";
      case false:
        return "NO";
      default:
        return null;
    }
  };
  return (
    <RadioGroup
      legend={legend}
      hintText={hintText}
      name={name}
      buttons={YES_NO_VALUES}
      selectedRadio={getSelectedRadio()}
      onChange={(v) => onChange(v === "YES")}
      onBlur={onBlur}
      validationStatus={validationStatus}
      errorMessage={errorMessage}
      required={required}
    />
  );
};

export default YesNoRadioGroup;
