import React from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

import Select from "../../commonComponents/Select";
import { RootState } from "../../store";

interface Props {
  facilityId: string | null;
  onChange: (facilityId: string | null) => void;
  validateField: () => void;
  validationStatus: (name: keyof PersonFormData) => "error" | undefined;
  errors: { [key: string]: string | undefined };
  hidden?: boolean;
}

const ALL_FACILITIES = "~~ALL-FACILITIES~~";
const NAME = "facilityId";

const FacilitySelect: React.FC<Props> = (props) => {
  const { t } = useTranslation();

  const facilities = useSelector<RootState, Facility[]>(
    (state) => state.facilities
  );

  if (props.hidden) {
    return null;
  }

  const facilityList = facilities.map((f) => ({
    label: f.name,
    value: f.id,
  }));
  facilityList.unshift({
    label: t("facility.form.allFacilities"),
    value: ALL_FACILITIES,
  });

  const onChange = (value: string | null) => {
    props.onChange(value === ALL_FACILITIES ? null : value);
  };

  return (
    <Select
      label={t("facility.form.heading")}
      name={NAME}
      value={props.facilityId === null ? ALL_FACILITIES : props.facilityId}
      onChange={onChange}
      onBlur={props.validateField}
      validationStatus={props.validationStatus(NAME)}
      errorMessage={props.errors[NAME]}
      options={facilityList}
      defaultOption={t("common.defaultDropdownOption")}
      defaultSelect={true}
      required
    />
  );
};

export default FacilitySelect;
