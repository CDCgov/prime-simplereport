import React, { useState } from "react";
import { ComboBox, Button } from "@trussworks/react-uswds";

import { useDocumentTitle } from "../utils/hooks";

import FacilityPopup from "./FacilityPopup";
import "./FacilitySelect.scss";

export interface FacilitySelectProps {
  setActiveFacility: (facility: Facility) => void;
  facilities: Facility[];
}

const FacilitySelect: React.FC<FacilitySelectProps> = ({
  facilities,
  setActiveFacility,
}) => {
  useDocumentTitle("Select facility");

  /**
   * Initial setup
   */
  const comboBoxId = "facility-selector-combobox";
  const facilityList = facilities.map((facility) => ({
    value: facility.id,
    label: facility.name,
  }));

  /**
   * Facility selection
   */
  const [facilitySelected, selectFacility] = useState<string | undefined>();
  function handleContinue() {
    const facility = facilities.find((f) => f.id === facilitySelected);
    if (facility) {
      setActiveFacility(facility);
    }
  }

  /**
   * HTML
   */
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
          selectFacility(facilityId);
        }}
      />
      <Button
        className="continue width-full margin-top-3 margin-bottom-2"
        type="button"
        onClick={handleContinue}
        disabled={!facilitySelected}
      >
        Continue
      </Button>
    </FacilityPopup>
  );
};

export default FacilitySelect;
