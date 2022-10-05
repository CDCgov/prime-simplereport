import React, { useEffect, useState } from "react";
import { ComboBox } from "@trussworks/react-uswds";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faCopy } from "@fortawesome/free-solid-svg-icons";

import TextInput from "../../commonComponents/TextInput";
import MultiSelect from "../../commonComponents/MultiSelect/MultiSelect";
import { MultiSelectDropdownOption } from "../../commonComponents/MultiSelect/MultiSelectDropdown/MultiSelectDropdown";
import { DeviceType } from "../../../generated/graphql";
import { Device } from "../../supportAdmin/DeviceType/DeviceForm";
import LabeledText from "../../commonComponents/LabeledText";

interface Props {
  formTitle: string;
  swabOptions: Array<MultiSelectDropdownOption>;
  supportedDiseaseOptions: Array<MultiSelectDropdownOption>;
  deviceOptions?: DeviceType[];
}

const DeviceLookup = (props: Props) => {
  const [device, updateDevice] = useState<Device | undefined>();

  const [copiedSlug, setCopiedSlug] = useState<string>();

  useEffect(() => {
    const timeout = copiedSlug
      ? setTimeout(() => {
          setCopiedSlug(undefined);
        }, 3000)
      : undefined;
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [copiedSlug]);

  async function copySlug(slug: string) {
    try {
      await navigator.clipboard.writeText(slug);
      setCopiedSlug(slug);
    } catch (e: any) {
      console.error(e);
    }
  }

  const updateDeviceAttribute = (name: string, value: any) => {
    if (device) {
      updateDevice({ ...device, [name]: value });
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
              ></div>
            </div>
            <div className="usa-card__body margin-top-1">
              {props.deviceOptions ? (
                <div className="grid-row grid-gap">
                  <div className="tablet:grid-col">
                    <LabeledText label={"Select device"} />
                    <ComboBox
                      className="usa-combo-box__full-width"
                      id="selectDevice"
                      name="selectDevice"
                      options={getDeviceOptions()}
                      onChange={(id) => {
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
                  <div style={{ position: "relative" }}>
                    <TextInput
                      label="Device name"
                      name="name"
                      value={device?.name}
                      onChange={onChange}
                      disabled={true}
                    />
                    {device && (
                      <button
                        style={{ bottom: 12, right: 15, position: "absolute" }}
                        className="usa-button usa-button--unstyled"
                        onClick={() => device?.name && copySlug(device?.name)}
                        arial-label={`Copy model for ${device?.name}`}
                      >
                        <FontAwesomeIcon
                          icon={copiedSlug === device?.name ? faCheck : faCopy}
                        />
                      </button>
                    )}
                    {device && copiedSlug === device?.name && <CopyTooltip />}
                  </div>
                </div>
              </div>
              <div className="grid-row grid-gap">
                <div className="tablet:grid-col">
                  <div style={{ position: "relative" }}>
                    <TextInput
                      label="Model"
                      name="model"
                      value={device?.model}
                      onChange={onChange}
                      disabled={true}
                    />
                    {device && (
                      <button
                        style={{ bottom: 12, right: 15, position: "absolute" }}
                        className="usa-button usa-button--unstyled"
                        onClick={() => device?.model && copySlug(device?.model)}
                        arial-label={`Copy model for ${device?.name}`}
                      >
                        <FontAwesomeIcon
                          icon={copiedSlug === device?.model ? faCheck : faCopy}
                        />
                      </button>
                    )}
                    {device && copiedSlug === device?.model && <CopyTooltip />}
                  </div>
                </div>
              </div>
              <div className="grid-row grid-gap">
                <div className="tablet:grid-col">
                  <div style={{ position: "relative" }}>
                    <TextInput
                      label="Manufacturer"
                      name="manufacturer"
                      value={device?.manufacturer}
                      onChange={onChange}
                      disabled={true}
                    />
                    {device && (
                      <button
                        style={{ bottom: 12, right: 15, position: "absolute" }}
                        className="usa-button usa-button--unstyled"
                        onClick={() =>
                          device?.manufacturer && copySlug(device?.manufacturer)
                        }
                        arial-label={`Copy model for ${device?.manufacturer}`}
                      >
                        <FontAwesomeIcon
                          icon={
                            copiedSlug === device?.manufacturer
                              ? faCheck
                              : faCopy
                          }
                        />
                      </button>
                    )}
                    {device && copiedSlug === device?.manufacturer && (
                      <CopyTooltip />
                    )}
                  </div>
                </div>
              </div>
              <div className="grid-row grid-gap">
                <div className="tablet:grid-col">
                  <div style={{ position: "relative" }}>
                    <TextInput
                      label="LOINC code"
                      name="loincCode"
                      value={device?.loincCode}
                      onChange={onChange}
                      disabled={true}
                    />
                    {device && (
                      <button
                        style={{ bottom: 12, right: 15, position: "absolute" }}
                        className="usa-button usa-button--unstyled"
                        onClick={() =>
                          device?.loincCode && copySlug(device?.loincCode)
                        }
                        arial-label={`Copy model for ${device?.name}`}
                      >
                        <FontAwesomeIcon
                          icon={
                            copiedSlug === device?.loincCode ? faCheck : faCopy
                          }
                        />
                      </button>
                    )}
                    {device && copiedSlug === device?.loincCode && (
                      <CopyTooltip />
                    )}
                  </div>
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
                    disabled={true}
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

export default DeviceLookup;

const TOOLTIP_OFFSET = 7;

const CopyTooltip = () => {
  const [spanRef, setSpanRef] = useState<HTMLSpanElement | null>(null);

  const marginTop = -TOOLTIP_OFFSET;
  const marginRight =
    -1 * (spanRef?.getBoundingClientRect().width || 0) - TOOLTIP_OFFSET;

  return (
    <span
      ref={(node) => {
        setSpanRef(node);
      }}
      className="usa-tooltip__body usa-tooltip__body--right is-set is-visible"
      style={{ right: 0, marginRight, marginTop }}
    >
      Copied!
    </span>
  );
};
