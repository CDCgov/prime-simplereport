import React from "react";
import { useSelector } from "react-redux";

import Dropdown from "../../commonComponents/Dropdown";

interface Props {
  facilityId: string | null;
  onChange: (facilityId: string | null) => void;
  validateField: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  validationStatus: (errorKey: string) => "error" | "success" | undefined;
  errors: { [key: string]: string | undefined };
  hidden?: boolean;
}

const ALL_FACILITIES = "~~ALL-FACILITIES~~";
const NAME = "currentFacilityId";

const FacilitySelect: React.FC<Props> = (props) => {
  const facilities = useSelector(
    (state) => (state as any).facilities as Facility[]
  );

  if (props.hidden) {
    return null;
  }

  const facilityList = facilities.map((f: any) => ({
    label: f.name,
    value: f.id,
  }));
  facilityList.unshift({ label: "All facilities", value: ALL_FACILITIES });
  facilityList.unshift({ label: "-Select-", value: "" });

  const onChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    props.onChange(value === ALL_FACILITIES ? null : value);
  };

  return (
    <Dropdown
      label="Facility"
      name={NAME}
      selectedValue={
        props.facilityId === null ? ALL_FACILITIES : props.facilityId
      }
      onChange={onChange}
      onBlur={props.validateField}
      //   validationStatus={props.validationStatus(NAME)}
      errorMessage={props.errors[NAME]}
      options={facilityList}
      required
    />
  );
};

export default FacilitySelect;
