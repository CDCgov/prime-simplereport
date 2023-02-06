import React, { useState } from "react";
import { ComboBox } from "@trussworks/react-uswds";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Button from "../../commonComponents/Button/Button";
import TextInput from "../../commonComponents/TextInput";
import MultiSelect from "../../commonComponents/MultiSelect/MultiSelect";
import { MultiSelectDropdownOption } from "../../commonComponents/MultiSelect/MultiSelectDropdown/MultiSelectDropdown";
import {
  DeviceType,
  SupportedDiseaseTestPerformedInput,
} from "../../../generated/graphql";
import Required from "../../commonComponents/Required";
import Select from "../../commonComponents/Select";

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
  supportedDiseaseTestPerformed: Array<SupportedDiseaseTestPerformedInput>;
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
    let supportedDiseaseTestPerformed: SupportedDiseaseTestPerformedInput[];
    if (device?.supportedDiseaseTestPerformed?.length) {
      supportedDiseaseTestPerformed = device.supportedDiseaseTestPerformed.map(
        (diseaseTestPerformed) => ({
          supportedDisease: diseaseTestPerformed.supportedDisease.internalId,
          testPerformedLoincCode: diseaseTestPerformed.testPerformedLoincCode,
        })
      );
    } else if (device?.supportedDiseases?.length) {
      supportedDiseaseTestPerformed = device.supportedDiseases.map(
        (supportedDisease) => {
          let testPerformedLoincCode = "";
          if (supportedDisease.name === "COVID-19") {
            testPerformedLoincCode = device.loincCode;
          }
          return {
            supportedDisease: supportedDisease.internalId,
            testPerformedLoincCode,
          };
        }
      );
    } else {
      supportedDiseaseTestPerformed = [
        {
          supportedDisease:
            props.supportedDiseaseOptions.find(
              (option) => option.label === "COVID-19"
            )?.value || "",
          testPerformedLoincCode: device?.loincCode || "",
        },
      ];
    }
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
          supportedDiseaseTestPerformed,
        }
      : undefined;
  };

  const createSupportedDiseaseRow = (index: number) => {
    return (
      <fieldset className={"usa-fieldset"}>
        <div className="grid-row grid-gap">
          <div className="tablet:grid-col">
            <Select
              label={"Supported disease"}
              options={props.supportedDiseaseOptions}
              value={
                device?.supportedDiseaseTestPerformed?.[index]
                  ?.supportedDisease || ""
              }
              onChange={(val) => {
                if (device?.supportedDiseaseTestPerformed) {
                  let newSupportedDisease = [
                    ...device?.supportedDiseaseTestPerformed,
                  ];
                  newSupportedDisease[index].supportedDisease = val;
                  updateDevice({
                    ...device,
                    supportedDiseaseTestPerformed: newSupportedDisease,
                  });
                }
              }}
              required={true}
              disabled={!device}
              defaultOption={""}
              defaultSelect={true}
              name={`selectSupportedDisease${index}`}
            />
          </div>
          <div className="tablet:grid-col">
            <TextInput
              label="Test performed code"
              name={`testPerformedCode${index}`}
              value={
                device?.supportedDiseaseTestPerformed?.[index]
                  ?.testPerformedLoincCode
              }
              onChange={(event) => {
                if (device?.supportedDiseaseTestPerformed) {
                  let newSupportedDisease = [
                    ...device?.supportedDiseaseTestPerformed,
                  ];
                  newSupportedDisease[index].testPerformedLoincCode =
                    event.target.value;
                  updateDeviceAttribute(
                    "supportedDiseaseTestPerformed",
                    newSupportedDisease
                  );
                  const covidId = props.supportedDiseaseOptions.find(
                    (d) => d.label === "COVID-19"
                  )?.value;
                  if (
                    device?.supportedDiseaseTestPerformed?.[index]
                      ?.supportedDisease === covidId
                  ) {
                    updateDeviceAttribute("loincCode", event.target.value);
                  }
                }
              }}
              disabled={!device}
              required
            />
          </div>
          <div className="flex-align-self-end">
            {index > 0 ? (
              <button
                className="usa-button--unstyled padding-105 height-5 cursor-pointer"
                onClick={() => {
                  if (device?.supportedDiseaseTestPerformed) {
                    let newSupportedDisease = [
                      ...device?.supportedDiseaseTestPerformed,
                    ];
                    newSupportedDisease.splice(index, 1);
                    updateDeviceAttribute(
                      "supportedDiseaseTestPerformed",
                      newSupportedDisease
                    );
                  }
                }}
                aria-label={`Delete disease`}
              >
                <FontAwesomeIcon icon={"trash"} className={"text-error"} />
              </button>
            ) : (
              <div className={"padding-205 height-5"}> </div>
            )}
          </div>
        </div>
      </fieldset>
    );
  };

  return (
    <div className="prime-home flex-1">
      <div className="grid-container">
        <div className="grid-row">
          <div className="prime-container card-container">
            <div className="usa-card__header">
              <h1 className="font-heading-lg margin-top-0 margin-bottom-0">
                {props.formTitle}
              </h1>
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
                    <label htmlFor="selectDevice">
                      <Required label={"Select device"} />
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
              {device?.supportedDiseaseTestPerformed?.map((disease, index) =>
                createSupportedDiseaseRow(index)
              )}
              <div className="grid-row grid-gap">
                <div
                  className="tablet:grid-col"
                  style={{ marginBottom: "56px" }}
                >
                  <Button
                    className="margin-top-2"
                    onClick={() => {
                      if (device?.supportedDiseaseTestPerformed) {
                        let newSupportedDisease = [
                          ...device?.supportedDiseaseTestPerformed,
                        ];
                        newSupportedDisease.push({
                          supportedDisease: "",
                          testPerformedLoincCode: "",
                        });
                        updateDeviceAttribute(
                          "supportedDiseaseTestPerformed",
                          newSupportedDisease
                        );
                      } else {
                        updateDeviceAttribute("supportedDiseaseTestPerformed", [
                          { supportedDisease: "", testPerformedLoincCode: "" },
                        ]);
                      }
                    }}
                    variant="unstyled"
                    label={"Add another disease"}
                    icon="plus"
                    disabled={!device}
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

export default DeviceForm;
