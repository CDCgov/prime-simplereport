import React from "react";
import TextInput from "../commonComponents/ManagedTextInput";

interface Props {
  facility: Facility;
  updateFacility: (facility: Facility) => void;
}

const FaciltiyInformation: React.FC<Props> = ({ facility, updateFacility }) => {
  const onChange = (field: keyof Facility, value: string) => {
    updateFacility({ ...facility, [field]: value });
  };

  return (
    <div className="grid-container">
      <div className="grid-row">
        <div className="prime-container usa-card__container">
          <div className="usa-card__header">
            <h2> Facility Information </h2>
          </div>
          <div className="usa-card__body">
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
            </div>
            <div className="grid-row grid-gap">
              <div className="tablet:grid-col">
                <TextInput
                  label={"Street 1"}
                  value={facility.street || ""}
                  onChange={(v) => onChange("street", v)}
                  disabled
                />
              </div>
              <div className="tablet:grid-col">
                <TextInput
                  label={"Street 2"}
                  value={facility.streetTwo || ""}
                  onChange={(v) => onChange("streetTwo", v)}
                  disabled
                />
              </div>
              <div className="tablet:grid-col">
                <TextInput
                  label={"City"}
                  value={facility.city || ""}
                  onChange={(v) => onChange("city", v)}
                  disabled
                />
              </div>
            </div>
            <div className="grid-row grid-gap">
              <div className="tablet:grid-col">
                <TextInput
                  label={"County"}
                  value={facility.county || ""}
                  onChange={(v) => onChange("county", v)}
                  disabled
                />
              </div>
              <div className="tablet:grid-col">
                <TextInput
                  label={"Zip Code"}
                  value={facility.zipCode || ""}
                  onChange={(v) => onChange("zipCode", v)}
                  disabled
                />
              </div>
              <div className="tablet:grid-col">
                <TextInput
                  label={"State"}
                  value={facility.state || ""}
                  onChange={(v) => onChange("state", v)}
                  disabled
                />
              </div>
              <div className="tablet:grid-col">
                <TextInput
                  label={"Phone Number"}
                  value={facility.phone || ""}
                  onChange={(v) => onChange("phone", v)}
                  disabled
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaciltiyInformation;
