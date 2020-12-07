import React from "react";
import { stateCodes } from "../../../../config/constants";
import Dropdown from "../../../commonComponents/Dropdown";
import TextInput from "../../../commonComponents/ManagedTextInput";

interface Props {
  facility: Facility;
  updateFacility: (facility: Facility) => void;
}

const FacilityInformation: React.FC<Props> = ({ facility, updateFacility }) => {
  const onChange = (field: keyof Facility, value: string) => {
    updateFacility({ ...facility, [field]: value });
  };

  return (
    <div className="">
      <h2 style={{ margin: 0 }}>Facility Information</h2>
      <div className="grid-row grid-gap">
        <div className="tablet:grid-col">
          <TextInput
            label={"Testing Facility Name"}
            value={facility.name || ""}
            onChange={(v) => onChange("name", v)}
          />
        </div>
        <div className="tablet:grid-col">
          <TextInput
            label={"CLIA Number"}
            value={facility.cliaNumber || ""}
            onChange={(v) => onChange("cliaNumber", v)}
          />
        </div>
        <div className="tablet:grid-col">
          <TextInput
            label={"Phone Number"}
            value={facility.phone || ""}
            onChange={(v) => onChange("phone", v)}
          />
        </div>
      </div>
      <div className="grid-row grid-gap">
        <div className="tablet:grid-col">
          <TextInput
            label={"Street 1"}
            value={facility.street || ""}
            onChange={(v) => onChange("street", v)}
          />
        </div>
      </div>
      <div className="grid-row grid-gap">
        <div className="tablet:grid-col">
          <TextInput
            label={"Street 2"}
            value={facility.streetTwo || ""}
            onChange={(v) => onChange("streetTwo", v)}
          />
        </div>
      </div>
      <div className="grid-row grid-gap">
        <div className="tablet:grid-col">
          <TextInput
            label={"City"}
            value={facility.city || ""}
            onChange={(v) => onChange("city", v)}
          />
        </div>
        <div className="tablet:grid-col">
          <TextInput
            label={"County"}
            value={facility.county || ""}
            onChange={(v) => onChange("county", v)}
          />
        </div>
        <div className="tablet:grid-col">
          <TextInput
            label={"Zip Code"}
            value={facility.zipCode || ""}
            onChange={(v) => onChange("zipCode", v)}
          />
        </div>
        <div className="tablet:grid-col">
          <Dropdown
            label="State"
            name="state"
            selectedValue={facility.state}
            options={stateCodes.map((c) => ({ label: c, value: c }))}
            addClass="prime-state"
            onChange={(e) =>
              onChange("state", (e.target as HTMLSelectElement).value)
            }
          />
        </div>
      </div>
    </div>
  );
};

export default FacilityInformation;
