import React, { useState } from "react";

import Button from "../../commonComponents/Button/Button";
import TextInput from "../../commonComponents/TextInput";
import MultiSelect from "../../commonComponents/MultiSelect/MultiSelect";
import { MultiSelectDropdownOption } from "../../commonComponents/MultiSelect/MultiSelectDropdown/MultiSelectDropdown";

import { Device } from "./DeviceTypeFormContainer";

interface Props {
  saveDeviceType: (device: Device) => void;
  swabOptions: MultiSelectDropdownOption[];
}

const DeviceTypeForm: React.FC<Props> = ({ saveDeviceType, swabOptions }) => {
  const [device, updateDevice] = useState<Device>({
    name: "",
    manufacturer: "",
    model: "",
    loincCode: "",
    swabTypes: [],
  });
  const [formChanged, updateFormChanged] = useState<boolean>(false);

  function updateDeviceAttribute(name: string, value: any) {
    updateDevice({ ...device, [name]: value });
    updateFormChanged(true);
  }

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    updateDeviceAttribute(e.target.name, e.target.value);
  };
  return (
    <main className="prime-home">
      <div className="grid-container">
        <div className="grid-row">
          <div className="prime-container card-container">
            <div className="usa-card__header">
              <div>
                <h2>Device type</h2>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Button
                  type="button"
                  onClick={() => saveDeviceType(device)}
                  label="Save changes"
                  disabled={!formChanged}
                />
              </div>
            </div>
            <div className="usa-card__body margin-top-1">
              <div>
                <div className="usa-alert usa-alert--warning">
                  <div className="usa-alert__body">
                    <h4 className="usa-alert__heading">Reminder</h4>
                    <p className="usa-alert__text">
                      Notify ReportStream of devices added in{" "}
                      <a
                        href="https://usds.slack.com/archives/C024MGSJZ38"
                        target="_blank"
                        rel="noreferrer"
                      >
                        #prime-reportstream
                      </a>
                      .
                    </p>
                    <p>
                      Device details can be found by downloading the mapping
                      tool (Excel file) from the{" "}
                      <a
                        href="https://www.cdc.gov/csels/dls/sars-cov-2-livd-codes.html"
                        target="_blank"
                        rel="noreferrer"
                      >
                        CDC test code mapping for COVID-19 page
                      </a>
                      .
                    </p>
                  </div>
                </div>
              </div>
              <div className="grid-row grid-gap">
                <div className="tablet:grid-col">
                  <TextInput
                    label="Device name"
                    name="name"
                    value={device.name}
                    onChange={onChange}
                    required
                  />
                </div>
                <div className="tablet:grid-col">
                  <TextInput
                    label="Manufacturer"
                    name="manufacturer"
                    value={device.manufacturer}
                    onChange={onChange}
                    required
                  />
                </div>
                <div className="tablet:grid-col">
                  <TextInput
                    label="Model"
                    name="model"
                    value={device.model}
                    onChange={onChange}
                    required
                  />
                </div>
                <div className="tablet:grid-col">
                  <TextInput
                    label="LOINC code"
                    name="loincCode"
                    value={device.loincCode}
                    onChange={onChange}
                    required
                  />
                </div>
              </div>
              <div className="grid-row grid-gap">
                <div
                  className="tablet:grid-col"
                  style={{ marginBottom: "56px" }}
                >
                  <MultiSelect
                    label="SNOMED code for swab type(s)"
                    name="swabTypes"
                    onChange={(swabTypes) => {
                      updateDeviceAttribute("swabTypes", swabTypes);
                    }}
                    options={swabOptions}
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default DeviceTypeForm;
