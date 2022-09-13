import React, { useState } from "react";
import { ComboBox } from "@trussworks/react-uswds";

import Button from "../../commonComponents/Button/Button";
import TextInput from "../../commonComponents/TextInput";
import MultiSelect from "../../commonComponents/MultiSelect/MultiSelect";
import { MultiSelectDropdownOption } from "../../commonComponents/MultiSelect/MultiSelectDropdown/MultiSelectDropdown";
import { DeviceType } from "../../../generated/graphql";

import DeviceTypeReminderMessage from "./DeviceTypeReminderMessage";

export interface Device {
  internalId?: string;
  name: string;
  manufacturer: string;
  model: string;
  loincCode: string;
  swabTypes: Array<string>;
  supportedDiseases: Array<string>;
  testLength: number;
}

interface Props {
  formTitle: string;
  saveDeviceType: (device: Device) => void;
  initialDevice?: Device;
  swabOptions: Array<MultiSelectDropdownOption>;
  supportedDiseaseOptions: Array<MultiSelectDropdownOption>;
  deviceOptions?: DeviceType[];
}

const DeviceForm = (props: Props) => {
  const [device, updateDevice] = useState<Device | undefined>(
    props.initialDevice
  );
  const [formChanged, updateFormChanged] = useState<boolean>(false);

  const updateDeviceAttribute = (name: string, value: any) => {
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
      ? props.deviceOptions
          .map((deviceType) => ({
            label: deviceType.name,
            value: deviceType.internalId,
          }))
          .sort((a, b) => a.label.localeCompare(b.label))
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
          testLength: device.testLength ? device.testLength : 15,
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
                    <label className="usa-legend" htmlFor="selectDevice">
                      Select Device{" "}
                      {true && <span className="text-secondary-vivid">*</span>}
                    </label>
                    <ComboBox
                      className="usa-combo-box__full-width"
                      id="selectDevice"
                      name="selectDevice"
                      options={getDeviceOptions()}
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
                      defaultValue={device?.internalId || ""}
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
              </div>
              <div className="grid-row grid-gap">
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
              </div>
              <div className="grid-row grid-gap">
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
              </div>
              <div className="grid-row grid-gap">
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
                <div className="tablet:grid-col">
                  <TextInput
                    type={"number"}
                    label="Test length (minutes)"
                    name="testLength"
                    min={0}
                    max={999}
                    value={device?.testLength.toString()}
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

export default DeviceForm;
