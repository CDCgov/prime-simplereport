import React from "react";

import { useTranslatedConstants } from "../constants";

import RadioGroup from "./RadioGroup";

export const boolToYesNoNotSure = (
  value: boolean | null | undefined
): YesNoNotSure | undefined => {
  if (value) {
    return "YES";
  }
  if (value === false) {
    return "NO";
  }
  if (value === null) {
    return "NOT_SURE";
  }
  return undefined;
};

export const yesNoNotSureToBool = (
  value: YesNoNotSure
): boolean | null | undefined => {
  if (value === "YES") {
    return true;
  }
  if (value === "NO") {
    return false;
  }
  if (value === "NOT_SURE") {
    return null;
  }
  return undefined;
};

interface Props {
  name: string;
  legend: React.ReactNode;
  value: YesNoNotSure | undefined;
  onChange: (value: YesNoNotSure) => void;
  hintText?: string;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  validationStatus?: "error" | "success";
  errorMessage?: React.ReactNode;
  required?: boolean;
}

const YesNoNotSureRadioGroup: React.FC<Props> = ({
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
  const { YES_NO_NOT_SURE_VALUES: values } = useTranslatedConstants();

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

export default YesNoNotSureRadioGroup;
