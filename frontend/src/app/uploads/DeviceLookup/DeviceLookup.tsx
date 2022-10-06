import React, { useEffect, useState } from "react";
import { ComboBox } from "@trussworks/react-uswds";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faCopy } from "@fortawesome/free-solid-svg-icons";

import TextInput from "../../commonComponents/TextInput";
import { DeviceType } from "../../../generated/graphql";
import LabeledText from "../../commonComponents/LabeledText";

export interface Device {
  internalId?: string;
  name: string;
  manufacturer: string;
  model: string;
  loincCode: string;
  swabTypes: Array<string>;
}

export interface SwabType {
  swabName: string;
  typeCode: string;
  internalId: string;
}

interface Props {
  formTitle: string;
  swabOptions: Array<SwabType>;
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
          loincCode: device.loincCode,
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
                      hintText={"equipment_model_name"}
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
                      hintText={"test_performed_code"}
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
                  <table className={"usa-table"}>
                    <thead>
                      <tr>
                        <th scope={"col"}>
                          SNOMED code for swab type(s)
                          <span className="usa-hint">specimen_type</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {device &&
                        props.swabOptions
                          .filter((swab) =>
                            device.swabTypes.includes(swab.internalId)
                          )
                          .map(({ swabName, typeCode }) => (
                            <tr key={swabName}>
                              <td>
                                <div></div>
                                <span>
                                  {swabName} ({typeCode})
                                </span>
                                {device && (
                                  <button
                                    // style={{bottom: 12, right: 15, position: "absolute"}}
                                    className="usa-button usa-button--unstyled"
                                    onClick={() =>
                                      typeCode && copySlug(typeCode)
                                    }
                                    arial-label={`Copy SNOMED code for ${swabName} (${typeCode})`}
                                  >
                                    <FontAwesomeIcon
                                      icon={
                                        copiedSlug === typeCode
                                          ? faCheck
                                          : faCopy
                                      }
                                    />
                                  </button>
                                )}
                                {device && copiedSlug === typeCode && (
                                  <CopyTooltip />
                                )}
                              </td>
                            </tr>
                          ))}
                    </tbody>
                  </table>
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

const CopyTooltip = () => {
  return (
    <span
      className="usa-tooltip__body usa-tooltip__body--right is-set is-visible"
      style={{ right: 0, marginRight: -75, marginTop: -37 }}
    >
      Copied!
    </span>
  );
};
