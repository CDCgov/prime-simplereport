import { gql, useQuery } from "@apollo/client";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import moment from "moment";
import {
  useAppInsightsContext,
  useTrackEvent,
} from "@microsoft/applicationinsights-react-js";

import { PATIENT_TERM_CAP } from "../../config/constants";
import { displayFullName } from "../utils";

const testResultQuery = gql`
  query Results($facilityId: String!) {
    testResults(facilityId: $facilityId) {
      internalId
      dateTested
      result
      deviceType {
        internalId
        name
      }
      patient {
        internalId
        firstName
        middleName
        lastName
        lookupId
      }
    }
  }
`;

const TestResultsList = () => {
  const appInsights = useAppInsightsContext();
  const trackFetchTestResults = useTrackEvent(
    appInsights,
    "Fetch Test Results"
  );

  useEffect(() => {
    trackFetchTestResults();
  }, [trackFetchTestResults]);
  const facilityId = useSelector((state) => state.facility.id);
  const { data, loading, error } = useQuery(testResultQuery, {
    variables: { facilityId: facilityId },
    fetchPolicy: "no-cache",
  });

  if (loading) {
    return <p>Loading</p>;
  }
  if (error) {
    appInsights.trackEvent({
      name: "Failed Fetching Tests Results",
    });
    return error;
  }

  const testResultRows = (testResults) => {
    if (testResults.length === 0) {
      return;
    }
    const byDateTested = (a, b) => {
      // ISO string dates sort nicely
      if (a.dateTested === b.dateTested) return 0;
      if (a.dateTested < b.dateTested) return 1;
      return -1;
    };
    // `sort` mutates the array, so make a copy
    return [...testResults].sort(byDateTested).map((r) => (
      <tr key={r.internalId}>
        <th scope="row">
          {displayFullName(
            r.patient.firstName,
            r.patient.middleName,
            r.patient.lastName
          )}
        </th>
        <td>{r.patient.lookupId}</td>
        <td>{moment(r.dateTested).format("lll")}</td>
        <td>{r.result}</td>
        <td>{r.deviceType.name}</td>
      </tr>
    ));
  };

  let rows = testResultRows(data.testResults);
  return (
    <main className="prime-home">
      <div className="grid-container">
        <div className="grid-row">
          <div className="prime-container usa-card__container">
            <div className="usa-card__header">
              <h2> Test Results </h2>
            </div>
            <div className="usa-card__body">
              <table className="usa-table usa-table--borderless width-full">
                <thead>
                  <tr>
                    <th scope="col">{PATIENT_TERM_CAP} Name</th>
                    <th scope="col">Unique ID</th>
                    <th scope="col">Date of Test</th>
                    <th scope="col">Result</th>
                    <th scope="col">Device</th>
                  </tr>
                </thead>
                <tbody>{rows}</tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default TestResultsList;
