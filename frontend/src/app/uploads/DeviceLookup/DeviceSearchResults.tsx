import React from "react";
import { Link } from "react-router-dom";

import { DeviceType } from "../../../generated/graphql";
import Button from "../../commonComponents/Button/Button";

interface SearchResultsProps {
  devices: DeviceType[];
  // TODO: fix this type
  setSelectedDevice: any;
  shouldShowSuggestions: boolean;
  loading: boolean;
  dropDownRef?: React.RefObject<HTMLDivElement>;
  queryString?: string;
}

const getTestTypeFromDeviceName = (deviceName: string): string => {
  if (!deviceName) {
    return "";
  }

  /*
   * Device test types (PCR, antigen, etc.) are not stored in a dedicated column in the devices
   * table, but instead are parenthesized and appended to the device name
   * Get the test type from inside the parentheses at the end of the string
   */
  const re = /\(([^()]*)\)$/;

  const match = deviceName.match(re);
  if (!match || match.length === 0) {
    return "";
  }

  return match[1];
};

const DeviceSearchResults = (props: SearchResultsProps) => {
  const {
    devices,
    setSelectedDevice,
    shouldShowSuggestions,
    loading,
    dropDownRef,
    queryString,
  } = props;

  let resultsContent;

  if (loading) {
    resultsContent = <p>Searching...</p>;
  } else if (devices.length === 0) {
    resultsContent = (
      <div
        className={
          "display-flex flex-column flex-align-center margin-x-7 margin-y-2"
        }
      >
        <div className="margin-bottom-105">
          No device found matching <strong>{queryString}</strong>
        </div>
        <div>
          Please try a different search term, or follow the instructions on the{" "}
          <Link to="/app">Upload Guide</Link> to look up the device code.
        </div>
      </div>
    );
  } else {
    resultsContent = (
      <table className="usa-table usa-table--borderless">
        <thead>
          <tr>
            <th scope="col">Manufacturer</th>
            <th scope="col">Equipment model name</th>
            <th scope="col">Test type</th>
            <th scope="col">Action</th>
          </tr>
        </thead>
        <tbody>
          {devices.map((d, idx) => (
            <tr key={d.internalId}>
              <td id={`device-${idx}`}>{d.manufacturer}</td>
              <td id={`model-name-${idx}`}>{d.model}</td>
              <td id={`test-type-${idx}`}>
                {getTestTypeFromDeviceName(d.name)}
              </td>
              <td id={`view-${idx}`}>
                {
                  <Button
                    label={"Select"}
                    onClick={() => {
                      setSelectedDevice(d);
                    }}
                  />
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
  const results = (
    <div className="card-container shadow-3 results-dropdown" ref={dropDownRef}>
      <div className="usa-card__body results-dropdown__body">
        {resultsContent}
      </div>
    </div>
  );
  return <>{shouldShowSuggestions && results}</>;
};
export default DeviceSearchResults;
