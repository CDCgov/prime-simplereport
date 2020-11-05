import React from "react";
import { v4 as uuidv4 } from "uuid";
import TextInput from "../commonComponents/TextInput";

const OrgSettings = ({ orgSettings, updateDeviceSettings }) => {
  const onInputChange = (e) => {
    let name = e.target.name;
    let value = e.target.value;
    let newOrgSettings = { ...orgSettings, [name]: value };
    updateDeviceSettings(newOrgSettings);
  };
  return (
    <div className="grid-container">
      <div className="grid-row">
        <div className="prime-container usa-card__container">
          <div className="usa-card__header">
            <h3> Facility Information </h3>
          </div>
          <div className="usa-card__body">
            <div className="grid-container">
              <div className="grid-row grid-gap">
                <div className="tablet:grid-col">
                  <TextInput
                    label={"Testing Facility Name"}
                    placeholder={`Facility Name`}
                    value={orgSettings.orgName || null}
                    onChange={onInputChange}
                    name="orgName"
                  />
                </div>
                <div className="tablet:grid-col">
                  <TextInput
                    label={"CLIA Number"}
                    placeholder={``}
                    value={orgSettings.cliaNumber}
                    onChange={onInputChange}
                    name="cliaNumber"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrgSettings;
