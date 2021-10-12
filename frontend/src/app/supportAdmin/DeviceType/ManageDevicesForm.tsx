import React, { useState } from "react";

import Button from "../../commonComponents/Button/Button";
import TextInput from "../../commonComponents/TextInput";
import MultiSelect from "../../commonComponents/MultiSelect/MultiSelect";
import { MultiSelectDropdownOption } from "../../commonComponents/MultiSelect/MultiSelectDropdown/MultiSelectDropdown";
import Select from "../../commonComponents/Select";
import { UpdateDeviceType, DeviceType } from "../../../generated/graphql";

import DeviceTypeReminderMessage from "./DeviceTypeReminderMessage";

interface Props {
  updateDeviceType: (device: UpdateDeviceType) => void;
  swabOptions: Array<MultiSelectDropdownOption>;
  devices: DeviceType[];
}

const ManageDevicesForm: React.FC<Props> = ({
  updateDeviceType,
  swabOptions,
  devices,
}) => {
  const [selectedDevice, setSelectedDevice] = useState<
    UpdateDeviceType | undefined
  >(undefined);

  const [formChanged, updateFormChanged] = useState<boolean>(false);

  function updateDeviceAttribute(name: string, value: any) {
    if (selectedDevice) {
      setSelectedDevice({ ...selectedDevice, [name]: value });
      updateFormChanged(true);
    }
  }

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    updateDeviceAttribute(e.target.name, e.target.value);
  };

  const getDeviceNames = () =>
    Array.from(
      devices.map((device) => ({
        label: device.name,
        value: device.internalId,
      }))
    );

  const getUpdateDeviceType = (device: DeviceType | undefined) => {
    if (!device) {
      return undefined;
    }
    return {
      internalId: device.internalId,
      name: device.name,
      manufacturer: device.manufacturer,
      model: device.model,
      swabTypes: device.swabTypes?.map((swab) => swab.internalId),
      loincCode: device.loincCode,
    } as UpdateDeviceType;
  };

  return (
    <main className="prime-home">
      <div className="grid-container">
        <div className="grid-row">
          <div className="prime-container card-container">
            <div className="usa-card__header">
              <div>
                <h2>Manage devices</h2>
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
                  onClick={() =>
                    selectedDevice && updateDeviceType(selectedDevice)
                  }
                  label="Save changes"
                  disabled={!formChanged || !selectedDevice}
                />
              </div>
            </div>
            <div className="usa-card__body margin-top-1">
              <DeviceTypeReminderMessage />
              <div className="grid-row grid-gap">
                <div className="tablet:grid-col">
                  <Select
                    label="Device name"
                    name="name"
                    value={selectedDevice?.internalId || ""}
                    options={getDeviceNames()}
                    defaultSelect
                    onChange={(id) => {
                      setSelectedDevice(
                        getUpdateDeviceType(
                          devices.find((device) => id === device.internalId)
                        )
                      );
                    }}
                    required
                  />
                </div>
                <div className="tablet:grid-col">
                  <TextInput
                    label="Manufacturer"
                    name="manufacturer"
                    value={selectedDevice?.manufacturer}
                    onChange={onChange}
                    disabled={!selectedDevice}
                    required
                  />
                </div>
                <div className="tablet:grid-col">
                  <TextInput
                    label="LOINC code"
                    name="loincCode"
                    value={selectedDevice?.loincCode}
                    onChange={onChange}
                    disabled={!selectedDevice}
                    required
                  />
                </div>
              </div>
              <div className="grid-row grid-gap">
                <div className="tablet:grid-col">
                  <TextInput
                    label="Model"
                    name="model"
                    value={selectedDevice?.model}
                    onChange={onChange}
                    disabled={!selectedDevice}
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
                    key={selectedDevice?.internalId}
                    label="SNOMED code for swab type(s)"
                    name="swabTypes"
                    onChange={(swabTypes) => {
                      updateDeviceAttribute("swabTypes", swabTypes);
                    }}
                    options={swabOptions}
                    initialSelectedValues={selectedDevice?.swabTypes}
                    disabled={!selectedDevice}
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

export default ManageDevicesForm;
