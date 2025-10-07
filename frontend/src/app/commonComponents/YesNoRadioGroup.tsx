import React from "react";

import { useTranslatedConstants } from "../constants";

import RadioGroup from "./RadioGroup";

export const boolToYesNoUnknown = (
  value: boolean | null | undefined
): YesNoUnknown | undefined => {
  if (value) {
    return "YES";
  }
  if (value === false) {
    return "NO";
  }
  if (value === null) {
    return "UNKNOWN";
  }
  return undefined;
};

export const yesNoUnknownToBool = (
  value: YesNoUnknown
): boolean | null | undefined => {
  if (value === "YES") {
    return true;
  }
  if (value === "NO") {
    return false;
  }
  if (value === "UNKNOWN") {
    return null;
  }
  return undefined;
};

interface Props {
  name: string;
  legend: React.ReactNode;
  value: YesNoUnknown | undefined;
  onChange: (value: YesNoUnknown) => void;
  hintText?: string;
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
  const { YES_NO_UNKNOWN_VALUES: values } = useTranslatedConstants();

  return (
    <RadioGroup
      legend={legend}
      hintText={hintText}
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
