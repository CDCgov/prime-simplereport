import React from "react";

import { useTranslatedConstants } from "../constants";

import RadioGroup from "./RadioGroup";

export const boolToYesNo = (
  value: boolean | null | undefined
): YesNo | undefined => {
  if (value) {
    return "YES";
  }
  if (value === false) {
    return "NO";
  }
  return undefined;
};

export const yesNoToBool = (value: YesNo): boolean | undefined => {
  if (value === "YES") {
    return true;
  }
  if (value === "NO") {
    return false;
  }
  return undefined;
};

interface Props {
  name: string;
  legend: React.ReactNode;
  value: YesNo | undefined;
  onChange: (value: YesNo) => void;
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
  const { YES_NO_VALUES: values } = useTranslatedConstants();

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
