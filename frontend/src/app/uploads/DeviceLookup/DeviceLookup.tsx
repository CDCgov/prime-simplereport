import React, { useEffect, useState } from "react";
import { ComboBox } from "@trussworks/react-uswds";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faCopy } from "@fortawesome/free-solid-svg-icons";

import TextInput from "../../commonComponents/TextInput";
import { DeviceType } from "../../../generated/graphql";
import Optional from "../../commonComponents/Optional";
import "./DeviceLookup.scss";
import LabeledText from "../../commonComponents/LabeledText";

interface Props {
  formTitle: string;
  deviceOptions?: DeviceType[];
}

const DeviceLookup = (props: Props) => {
  const [device, updateDevice] = useState<DeviceType | undefined>();

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

  const onChange = () => {};

  const getDeviceOptions = () =>
    props.deviceOptions
      ? props.deviceOptions
          .map((deviceType) => ({
            label: deviceType.name,
            value: deviceType.internalId,
          }))
          .sort((a, b) => a.label.localeCompare(b.label))
      : [];

  const getCopyToClipboardButton = (
    copiedAttribute: string | undefined,
    label: string
  ) => {
    return (
      <div className="copy-button-container copy-button-tooltip">
        {device && (
          <button
            className="usa-button usa-button--unstyled"
            onClick={() => copiedAttribute && copySlug(copiedAttribute)}
            aria-label={`${label}`}
          >
            <FontAwesomeIcon
              icon={copiedSlug === copiedAttribute ? faCheck : faCopy}
            />
          </button>
        )}
        {device && copiedSlug === copiedAttribute && <CopyTooltip />}
      </div>
    );
  };

  return (
    <div className="prime-home device-lookup-container flex-1">
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
                    <label>
                      <LabeledText label={"Select device"} />
                      <ComboBox
                        className="usa-combo-box__full-width"
                        id="selectDevice"
                        name="selectDevice"
                        options={getDeviceOptions()}
                        onChange={(id) => {
                          updateDevice(
                            props.deviceOptions?.find(
                              (d) => id === d.internalId
                            )
                          );
                        }}
                        defaultValue={device?.internalId || ""}
                      />
                    </label>
                  </div>
                </div>
              ) : null}
              <div className="grid-row grid-gap">
                <div className="tablet:grid-col">
                  <div className="text-field">
                    <TextInput
                      label="Equipment model name"
                      name="Equipment model name"
                      hintText={<code>equipment_model_name</code>}
                      value={device?.model}
                      onChange={onChange}
                      disabled={true}
                    />
                    {getCopyToClipboardButton(
                      device?.model,
                      `Copy equipment model name for ${device?.name}`
                    )}
                  </div>
                </div>
              </div>
              <div className="grid-row grid-gap">
                <div className="tablet:grid-col">
                  <div className="text-field">
                    <TextInput
                      label="Test performed code "
                      name="Test performed code "
                      hintText={<code>test_performed_code</code>}
                      value={device?.loincCode}
                      onChange={onChange}
                      disabled={true}
                    />
                    {getCopyToClipboardButton(
                      device?.loincCode,
                      `Copy Test performed code for ${device?.name}`
                    )}
                  </div>
                </div>
              </div>
              <div className="grid-row grid-gap">
                <div className="tablet:grid-col">
                  <div style={{ position: "relative" }}>
                    <div className="usa-form-group">
                      <label className="usa-label">
                        <Optional label="Specimen Type" />
                      </label>
                      <span className="usa-hint">
                        <code>specimen_type</code>
                      </span>
                      <table className={"usa-table"}>
                        <tbody>
                          {device &&
                            device.swabTypes.map(({ name, typeCode }) => (
                              <tr key={name}>
                                <td>{name}</td>
                                <td>
                                  <div
                                    style={{ position: "relative" }}
                                    className="display-flex flex-justify"
                                  >
                                    <span>{typeCode}</span>
                                    <div className={"copy-button-container"}>
                                      {device && (
                                        <button
                                          className="usa-button usa-button--unstyled copy-button"
                                          onClick={() =>
                                            typeCode && copySlug(typeCode)
                                          }
                                          aria-label={`Copy SNOMED code for ${name} (${typeCode})`}
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
                                    </div>
                                  </div>
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
        </div>
      </div>
    </div>
  );
};

export default DeviceLookup;

const CopyTooltip = () => {
  return (
    <span
      className="usa-tooltip__body usa-tooltip__body--right is-set is-visible"
      style={{ right: 0, marginRight: -75 }}
    >
      Copied!
    </span>
  );
};
