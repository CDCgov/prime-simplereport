import { gql, useQuery } from "@apollo/client";
import React, { useEffect, useState } from "react";
import moment from "moment";
import {
  useAppInsightsContext,
  useTrackEvent,
} from "@microsoft/applicationinsights-react-js";

import { PATIENT_TERM_CAP } from "../../config/constants";
import { displayFullName } from "../utils";
import TestResultPrintModal from "./TestsResultPrintModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisH } from "@fortawesome/free-solid-svg-icons";
import { Menu, MenuItem, MenuButton } from "@szhsin/react-menu";
import "@szhsin/react-menu/dist/index.css";
import "./TestResultsList.scss";

export const testResultQuery = gql`
  query GetFacilityResults($facilityId: String!) {
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

interface Props {
  activeFacilityId: string;
}

const TestResultsList: any = ({ activeFacilityId }: Props) => {
  const appInsights = useAppInsightsContext();
  const trackFetchTestResults = useTrackEvent(
    appInsights,
    "Fetch Test Results",
    {}
  );

  useEffect(() => {
    trackFetchTestResults({});
  }, [trackFetchTestResults]);
  const { data, loading, error } = useQuery(testResultQuery, {
    variables: { facilityId: activeFacilityId },
    fetchPolicy: "no-cache",
  });
  const [printModalId, setPrintModalId] = useState(undefined);

  if (loading) {
    return <p>Loading</p>;
  }
  if (error) {
    appInsights.trackEvent({
      name: "Failed Fetching Tests Results",
    });
    return error;
  }

  if (printModalId) {
    return (
      <TestResultPrintModal
        testResultId={printModalId}
        closeModal={() => setPrintModalId(undefined)}
      />
    );
  }

  const testResultRows = (testResults: any) => {
    if (testResults.length === 0) {
      return;
    }
    const byDateTested = (a: any, b: any) => {
      // ISO string dates sort nicely
      if (a.dateTested === b.dateTested) return 0;
      if (a.dateTested < b.dateTested) return 1;
      return -1;
    };
    // `sort` mutates the array, so make a copy
    return [...testResults].sort(byDateTested).map((r) => (
      <tr key={r.internalId} className="sr-test-result-row">
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
        <td>
          <Menu
            menuButton={
              <MenuButton className="sr-modal-menu-button">
                <FontAwesomeIcon icon={faEllipsisH} size="2x" />
                <span className="usa-sr-only">More actions</span>
              </MenuButton>
            }
          >
            <MenuItem onClick={() => setPrintModalId(r.internalId)}>
              Print Result
            </MenuItem>
          </Menu>
        </td>
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
                    <th scope="col">Actions</th>
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
