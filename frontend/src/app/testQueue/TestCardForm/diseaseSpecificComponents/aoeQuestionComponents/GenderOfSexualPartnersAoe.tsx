import React from "react";

import MultiSelect from "../../../../commonComponents/MultiSelect/MultiSelect";
import { GENDER_IDENTITY_VALUES } from "../../../../constants";
import { AoeQuestionProps } from "../aoeUtils";

export const GenderOfSexualPartnersAoe = ({
  testOrderId,
  responses,
  hasAttemptedSubmit,
  onResponseChange,
  required = false,
  sensitiveTopicsTooltipModal,
}: AoeQuestionProps) => {
  const onSexualPartnerGenderChange = (selectedItems: string[]) => {
    onResponseChange({
      ...responses,
      genderOfSexualPartners: selectedItems,
    });
  };
  const selectedGenders: string[] = [];
  responses.genderOfSexualPartners?.forEach((g) => {
    if (g) {
      selectedGenders.push(g);
    }
  });
  const isGenderOfSexualPartnersAnswered =
    !!responses.genderOfSexualPartners &&
    responses.genderOfSexualPartners.length > 0;
  const showGenderOfSexualPartnersError =
    hasAttemptedSubmit && !isGenderOfSexualPartnersAnswered;

  return (
    <MultiSelect
      name={`sexual-partner-gender-${testOrderId}`}
      options={GENDER_IDENTITY_VALUES}
      onChange={onSexualPartnerGenderChange}
      initialSelectedValues={selectedGenders}
      label={
        <>
          What is the gender of their sexual partners?{" "}
          <span className={"text-base-dark"}>(Select all that apply.)</span>
        </>
      }
      required={required}
      hintText={sensitiveTopicsTooltipModal}
      hintTextClassName={""}
      validationStatus={showGenderOfSexualPartnersError ? "error" : undefined}
      errorMessage={
        showGenderOfSexualPartnersError &&
        "Please answer this required question."
      }
    />
  );
};
