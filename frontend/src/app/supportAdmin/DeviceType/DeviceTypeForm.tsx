import React, { useState } from "react";

import Button from "../../commonComponents/Button/Button";
import TextInput from "../../commonComponents/TextInput";
import MultiSelect from "../../commonComponents/MultiSelect/MultiSelect";
import { MultiSelectDropdownOption } from "../../commonComponents/MultiSelect/MultiSelectDropdown/MultiSelectDropdown";

import { Device } from "./DeviceTypeFormContainer";
import DeviceTypeReminderMessage from "./DeviceTypeReminderMessage";

interface Props {
  saveDeviceType: (device: Device) => void;
  swabOptions: Array<MultiSelectDropdownOption>;
  supportedDiseaseOptions: Array<MultiSelectDropdownOption>;
}

const DeviceTypeForm: React.FC<Props> = ({
  saveDeviceType,
  swabOptions,
  supportedDiseaseOptions,
}) => {
  const [device, updateDevice] = useState<Device>({
    name: "",
    manufacturer: "",
    model: "",
    loincCode: "",
    swabTypes: [],
    supportedDiseases: [],
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
              <DeviceTypeReminderMessage />
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
                <div className="tablet:grid-col">
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
              <div className="grid-row grid-gap">
                <div
                  className="tablet:grid-col"
                  style={{ marginBottom: "56px" }}
                >
                  <MultiSelect
                    label="Supported diseases"
                    name="supportedDiseases"
                    onChange={(supportedDiseases) => {
                      updateDeviceAttribute(
                        "supportedDiseases",
                        supportedDiseases
                      );
                    }}
                    options={supportedDiseaseOptions}
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
