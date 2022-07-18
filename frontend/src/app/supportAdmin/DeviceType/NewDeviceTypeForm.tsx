import React, { useState } from "react";

import Button from "../../commonComponents/Button/Button";
import TextInput from "../../commonComponents/TextInput";
import MultiSelect from "../../commonComponents/MultiSelect/MultiSelect";
import { MultiSelectDropdownOption } from "../../commonComponents/MultiSelect/MultiSelectDropdown/MultiSelectDropdown";
import Select from "../../commonComponents/Select";
import { DeviceType } from "../../../generated/graphql";

import { Device } from "./DeviceTypeFormContainer";
import DeviceTypeReminderMessage from "./DeviceTypeReminderMessage";

interface Props {
  formTitle: string;
  saveDeviceType: (device: Device) => void;
  initialDevice?: Device;
  swabOptions: Array<MultiSelectDropdownOption>;
  supportedDiseaseOptions: Array<MultiSelectDropdownOption>;
  deviceOptions?: DeviceType[];
}

const NewDeviceTypeForm = (props: Props) => {
  const [device, updateDevice] = useState<Device | undefined>(
    props.initialDevice
  );
  const [formChanged, updateFormChanged] = useState<boolean>(false);

  const updateDeviceAttribute = (name: string, value: any) => {
    // console.log(`updating device attribute ${name} to value ${value}`);
    if (device) {
      updateDevice({ ...device, [name]: value });
      updateFormChanged(true);
    }
  };

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    updateDeviceAttribute(e.target.name, e.target.value);
  };

  const getDeviceOptions = () =>
    props.deviceOptions
      ? props.deviceOptions.map((deviceType) => ({
          label: deviceType.name,
          value: deviceType.internalId,
        }))
      : [];

  const getDeviceFromDeviceType = (device?: DeviceType): Device | undefined => {
    return device
      ? {
          internalId: device.internalId,
          name: device.name,
          manufacturer: device.manufacturer,
          model: device.model,
          swabTypes: device.swabTypes?.map((swab) => swab.internalId),
          supportedDiseases:
            device.supportedDiseases?.map((disease) => disease.internalId) ||
            [],
          loincCode: device.loincCode,
          testLength: device.testLength,
        }
      : undefined;
  };

  return (
    <main className="prime-home">
      <div className="grid-container">
        <div className="grid-row">
          <div className="prime-container card-container">
            <div className="usa-card__header">
              <div>
                <h2>{props.formTitle}</h2>
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
                  onClick={() => device && props.saveDeviceType(device)}
                  label="Save changes"
                  disabled={!formChanged || !device}
                />
              </div>
            </div>
            <div className="usa-card__body margin-top-1">
              <DeviceTypeReminderMessage />
              {props.deviceOptions ? (
                <div className="grid-row grid-gap">
                  <div className="tablet:grid-col">
                    <Select
                      label="Select device"
                      name="selectDevice"
                      value={device?.internalId || ""}
                      options={getDeviceOptions()}
                      defaultSelect
                      onChange={(id) => {
                        updateFormChanged(false);
                        updateDevice(
                          getDeviceFromDeviceType(
                            props.deviceOptions?.find(
                              (d) => id === d.internalId
                            )
                          )
                        );
                      }}
                      required
                    />
                  </div>
                </div>
              ) : null}
              <div className="grid-row grid-gap">
                <div className="tablet:grid-col">
                  <TextInput
                    label="Device name"
                    name="name"
                    value={device?.name}
                    onChange={onChange}
                    disabled={!device}
                    required
                  />
                </div>
                <div className="tablet:grid-col">
                  <TextInput
                    label="Manufacturer"
                    name="manufacturer"
                    value={device?.manufacturer}
                    onChange={onChange}
                    disabled={!device}
                    required
                  />
                </div>
                <div className="tablet:grid-col">
                  <TextInput
                    label="Model"
                    name="model"
                    value={device?.model}
                    onChange={onChange}
                    disabled={!device}
                    required
                  />
                </div>
                <div className="tablet:grid-col">
                  <TextInput
                    label="LOINC code"
                    name="loincCode"
                    value={device?.loincCode}
                    onChange={onChange}
                    disabled={!device}
                    required
                  />
                </div>
              </div>
              <div className="grid-row grid-gap">
                <div className="tablet:grid-col">
                  <MultiSelect
                    key={device?.internalId}
                    label="SNOMED code for swab type(s)"
                    name="swabTypes"
                    onChange={(swabTypes) => {
                      updateDeviceAttribute("swabTypes", swabTypes);
                    }}
                    options={props.swabOptions}
                    initialSelectedValues={
                      device?.swabTypes.length ? device?.swabTypes : undefined
                    }
                    disabled={!device}
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
                    key={device?.internalId}
                    label="Supported diseases"
                    name="supportedDiseases"
                    onChange={(supportedDiseases) => {
                      updateDeviceAttribute(
                        "supportedDiseases",
                        supportedDiseases
                      );
                    }}
                    options={props.supportedDiseaseOptions}
                    initialSelectedValues={
                      device?.supportedDiseases.length
                        ? device?.supportedDiseases
                        : undefined
                    }
                    disabled={!device}
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

export default NewDeviceTypeForm;
