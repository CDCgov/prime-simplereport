import React from "react";

import { useTranslatedConstants } from "../constants";

import RadioGroup from "./RadioGroup";

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
