import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import "./DeviceLookup.scss";
import React, { useEffect, useState } from "react";
import { faCheck } from "@fortawesome/free-solid-svg-icons/faCheck";
import { faCopy } from "@fortawesome/free-solid-svg-icons/faCopy";
import { capitalize } from "lodash";

import Optional from "../../commonComponents/Optional";
import TextInput from "../../commonComponents/TextInput";
import CopyTooltip from "../../commonComponents/CopyTooltip";
import { DeviceType } from "../../../generated/graphql";
import { TEST_RESULTS } from "../../testResults/constants";

const testResultCodes = {
  [TEST_RESULTS.POSITIVE]: "260373001",
  [TEST_RESULTS.NEGATIVE]: "260415000",
  [TEST_RESULTS.UNDETERMINED]: "419984006",
};

const onChange = () => {};

const DeviceDetails = (props: { device: DeviceType }) => {
  const { device } = props;
  const [copiedSlug, setCopiedSlug] = useState<string>();

  async function copySlug(slug: string) {
    try {
      await navigator.clipboard.writeText(slug);
      setCopiedSlug(slug);
    } catch (e: any) {
      console.error(e);
    }
  }

  const getCopyToClipboardButton = (
    copiedAttribute: string | undefined,
    label: string,
    inTable?: boolean
  ) => {
    return (
      <div
        className={inTable ? "copy-button-container" : "copy-button-tooltip"}
      >
        <button
          className="usa-button usa-button--unstyled copy-button"
          onClick={() => copiedAttribute && copySlug(copiedAttribute)}
          aria-label={`${label}`}
        >
          <FontAwesomeIcon
            icon={copiedSlug === copiedAttribute ? faCheck : faCopy}
          />
        </button>
        {copiedSlug === copiedAttribute && <CopyTooltip />}
      </div>
    );
  };

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

  return (
    <>
      <div className="grid-row grid-gap">
        <div className="tablet:grid-col">
          <div className="text-field">
            <p>You've selected:</p>
            <h2 className="font-sans-md">{device.name}</h2>
            <TextInput
              label="Equipment model name"
              name="Equipment model name"
              hintText={<code>equipment_model_name</code>}
              value={device.model}
              onChange={onChange}
              disabled={true}
            />
            {getCopyToClipboardButton(
              device.model,
              `Copy equipment model name for ${device.name}`
            )}
          </div>
        </div>
      </div>
      <div className="grid-row grid-gap">
        <div className="tablet:grid-col">
          <div className="text-field">
            <TextInput
              label="Test performed code"
              name="Test performed code"
              hintText={<code>test_performed_code</code>}
              value={device.loincCode}
              onChange={onChange}
              disabled={true}
            />
            {getCopyToClipboardButton(
              device.loincCode,
              `Copy Test performed code for ${device.name}`
            )}
          </div>
        </div>
      </div>

      <div className="grid-row grid-gap">
        <div className="tablet:grid-col">
          <div style={{ position: "relative" }}>
            <div className="usa-form-group">
              <label id="test-result" className="usa-label">
                <Optional label="Test result" />
              </label>
              <span className="usa-hint">
                <code>test_result</code>
              </span>
              <table aria-labelledby="test-result" className={"usa-table"}>
                <tbody>
                  {Object.entries(testResultCodes).map(([result, code]) => (
                    <tr key={result}>
                      <td>{capitalize(result)}</td>
                      <td>
                        <div
                          style={{ position: "relative" }}
                          className="display-flex flex-justify"
                        >
                          <span>{code}</span>
                          {getCopyToClipboardButton(
                            code,
                            `Copy code for ${result} (${code})`,
                            true
                          )}
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

      <div className="grid-row grid-gap">
        <div className="tablet:grid-col">
          <div style={{ position: "relative" }}>
            <div className="usa-form-group">
              <label id="specimen-type" className="usa-label">
                <Optional label="Specimen type" />
              </label>
              <span className="usa-hint">
                <code>specimen_type</code>
              </span>
              <table aria-labelledby="specimen-type" className={"usa-table"}>
                <tbody>
                  {device.swabTypes?.map(({ name, typeCode }) => (
                    <tr key={name}>
                      <td>{name}</td>
                      <td>
                        <div
                          style={{ position: "relative" }}
                          className="display-flex flex-justify"
                        >
                          <span>{typeCode}</span>
                          {getCopyToClipboardButton(
                            typeCode,
                            `Copy SNOMED code for ${name} (${typeCode})`,
                            true
                          )}
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
    </>
  );
};

export default DeviceDetails;
