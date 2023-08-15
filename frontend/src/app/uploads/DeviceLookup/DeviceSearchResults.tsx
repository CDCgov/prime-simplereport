import React from "react";

import {
  DeviceType,
  SupportedDiseaseTestPerformed,
} from "../../../generated/graphql";
import Button from "../../commonComponents/Button/Button";

interface SearchResultsProps {
  items: DeviceType[];
  setSelectedItem: (d: DeviceType | null) => void;
  shouldShowSuggestions: boolean;
  loading: boolean;
  dropDownRef?: React.RefObject<HTMLDivElement>;
  queryString?: string;
  multiSelect?: boolean;
}

const DeviceSearchResults = (props: SearchResultsProps) => {
  const {
    items,
    setSelectedItem,
    shouldShowSuggestions,
    loading,
    dropDownRef,
    queryString,
    multiSelect,
  } = props;

  let resultsContent;

  if (loading) {
    resultsContent = <p>Searching...</p>;
  } else if (items.length === 0) {
    resultsContent = (
      <div
        className={
          "display-flex flex-column flex-align-center margin-x-2 margin-y-2"
        }
      >
        <div className="margin-bottom-105">
          {queryString ? (
            <>
              No device found matching <strong>{queryString}</strong>.
            </>
          ) : (
            <>No devices found.</>
          )}
        </div>
        {multiSelect ? (
          <span>
            Please check the list of added devices or try a different search
            term from the device's name or manufacturer.
          </span>
        ) : (
          <span>
            Please try a different search term from the device's name or
            manufacturer. <br /> If you need help, contact{" "}
            <a href="mailto:support@simplereport.gov">
              support@simplereport.gov
            </a>
            .
          </span>
        )}
      </div>
    );
  } else {
    resultsContent = (
      <table
        className="usa-table usa-table--borderless"
        aria-describedby={"device-result-table-desc"}
      >
        <thead>
          <tr>
            <th scope="col">Manufacturer</th>
            <th scope="col">Equipment model name</th>
            <th scope="col">Test type</th>
            <th scope="col">Action</th>
          </tr>
        </thead>
        <tbody>
          {items.map((d, idx) => {
            return (
              <tr key={d.internalId} aria-label={`device-${idx}`}>
                <td id={`device-${idx}`}>{d.manufacturer}</td>
                <td id={`model-name-${idx}`}>{d.model}</td>
                <td id={`test-type-${idx}`}>
                  {d.supportedDiseaseTestPerformed
                    ?.reduce(
                      (
                        diseaseNames: Array<String>,
                        disease: SupportedDiseaseTestPerformed
                      ) => {
                        const diseaseName = disease.supportedDisease.name;

                        if (!diseaseNames.includes(diseaseName)) {
                          diseaseNames.push(diseaseName);
                        }

                        return diseaseNames;
                      },
                      []
                    )
                    .join(", ")}
                </td>
                <td id={`view-${idx}`}>
                  {
                    <Button
                      label={multiSelect ? "Add" : "Select"}
                      ariaLabel={`Select ${d.manufacturer} ${d.model}`}
                      onClick={() => {
                        setSelectedItem(d);
                      }}
                    />
                  }
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  }

  const results = (
    <div
      id={"multi-select-deviceTypes-list"}
      className="card-container shadow-3 results-dropdown"
      ref={dropDownRef}
      aria-live="polite"
      role="region"
      aria-atomic="true"
    >
      <div className="usa-sr-only" id={"device-result-table-desc"}>
        device search results
      </div>
      <div className="usa-card__body results-dropdown__body">
        {resultsContent}
      </div>
    </div>
  );

  return <>{shouldShowSuggestions && results}</>;
};

export default DeviceSearchResults;
