import React from "react";
import { Link } from "react-router-dom";

import { DeviceType } from "../../../generated/graphql";

interface SearchResultsProps {
  devices: DeviceType[];
  shouldShowSuggestions: boolean;
  loading: boolean;
  dropDownRef?: React.RefObject<HTMLDivElement>;
}

/*
export interface QueueProps extends SearchResultsProps {
    page: "queue";
    onAddToQueue: (
        a: Patient,
        b: AoEAnswersDelivery,
        c: string
    ) => Promise<string | void>;
    patientsInQueue: string[];
}

export interface TestResultsProps extends SearchResultsProps {
    page: "test-results";
    onPatientSelect: (a: Patient) => void;
}
*/

const DeviceSearchResults = (props: SearchResultsProps) => {
  const { devices, shouldShowSuggestions, loading, dropDownRef } = props;

  // const [dialogDevice, setDialogDevice] = useState<Device | null>(null);
  // const [redirect, setRedirect] = useState<string | undefined>(undefined);

  // const activeFacilityId = getFacilityIdFromUrl(useLocation());

  /*
  if (redirect) {
    return <Navigate to={redirect} />;
  }
     */

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
          No device found matching {<strong>xxx</strong>}
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
          </tr>
        </thead>
        <tbody>
          {devices.map((d, idx) => (
            <tr key={d.internalId}>
              <td id={`device-${idx}`}>{d.manufacturer}</td>
              <td id={`model-name-${idx}`}>{d.model}</td>
              <td id={`test-type-${idx}`}>{d.supportedDiseases}</td>
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
