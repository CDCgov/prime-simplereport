import React, { useState } from "react";
import { ComboBox, Button } from "@trussworks/react-uswds";

import { useDocumentTitle } from "../utils/hooks";

import FacilityPopup from "./FacilityPopup";
import "./FacilitySelect.scss";

export interface FacilitySelectProps {
  facilities: Facility[];
  onFacilitySelect: (facility: Facility) => void;
}

const FacilitySelect: React.FC<FacilitySelectProps> = ({
  facilities,
  onFacilitySelect,
}) => {
  useDocumentTitle("Select facility");

  const comboBoxId = "facility-selector-combobox";
  const facilityList = facilities.map((facility) => ({
    value: facility.id,
    label: facility.name,
  }));

  const [selectedFacilityId, setSelectedFacilityId] = useState<
    string | undefined
  >();

  const handleContinue = () => {
    const facility = facilities.find((f) => f.id === selectedFacilityId);
    if (!facility) return;
    onFacilitySelect(facility);
  };

  return (
    <FacilityPopup>
      <label className="select-text" htmlFor={comboBoxId}>
        Select your facility
      </label>
      <ComboBox
        options={facilityList}
        name={comboBoxId}
        id={comboBoxId}
        onChange={(facilityId) => {
          setSelectedFacilityId(facilityId);
        }}
      />
      <Button
        className="continue width-full margin-top-3 margin-bottom-2"
        type="button"
        onClick={handleContinue}
        disabled={!selectedFacilityId}
      >
        Continue
      </Button>
    </FacilityPopup>
  );
};

export default FacilitySelect;
