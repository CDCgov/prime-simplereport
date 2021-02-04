import { gql } from "@apollo/client";
import React, { useState } from "react";
import moment from "moment";
import classnames from "classnames";
import { PATIENT_TERM_CAP } from "../../config/constants";
import { displayFullName } from "../utils";
import TestResultPrintModal from "./TestResultPrintModal";
import TestResultCorrectionModal from "./TestResultCorrectionModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisH } from "@fortawesome/free-solid-svg-icons";
import { Menu, MenuItem, MenuButton } from "@szhsin/react-menu";
import "@szhsin/react-menu/dist/index.css";
import "./TestResultsList.scss";
import {
  InjectedQueryWrapperProps,
  QueryWrapper,
} from "../commonComponents/QueryWrapper";

export const testResultQuery = gql`
  query GetFacilityResults($facilityId: String!) {
    testResults(facilityId: $facilityId) {
      internalId
      dateTested
      result
      correctionStatus
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
  data: any;
  trackAction: () => void;
  refetch: () => void;
}

export const DetachedTestResultsList: any = ({ data, refetch }: Props) => {
  const [printModalId, setPrintModalId] = useState(undefined);
  const [markErrorId, setMarkErrorId] = useState(undefined);

  if (printModalId) {
    return (
      <TestResultPrintModal
        testResultId={printModalId}
        closeModal={() => setPrintModalId(undefined)}
      />
    );
  }
  if (markErrorId) {
    return (
      <TestResultCorrectionModal
        testResultId={markErrorId}
        closeModal={() => {
          setMarkErrorId(undefined);
          refetch();
        }}
      />
    );
  }

  const testResults = data.testResults;

  const testResultRows = () => {
    const byDateTested = (a: any, b: any) => {
      // ISO string dates sort nicely
      if (a.dateTested === b.dateTested) return 0;
      if (a.dateTested < b.dateTested) return 1;
      return -1;
    };

    if (testResults.length === 0) {
      return <tr>"No results"</tr>;
    }
    // When printing is enabled add this menu item
    // <MenuItem onClick={() => setPrintModalId(r.internalId)}>
    //   Print result
    // </MenuItem>

    // `sort` mutates the array, so make a copy
    return [...testResults].sort(byDateTested).map((r) => (
      <tr
        key={r.internalId}
        title={r.correctionStatus === "REMOVED" ? "Marked as error" : ""}
        className={classnames(
          "sr-test-result-row",
          r.correctionStatus === "REMOVED" && "sr-test-result-row--removed"
        )}
      >
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
          {r.correctionStatus !== "REMOVED" && (
            <Menu
              menuButton={
                <MenuButton className="sr-modal-menu-button">
                  <FontAwesomeIcon icon={faEllipsisH} size="2x" />
                  <span className="usa-sr-only">More actions</span>
                </MenuButton>
              }
            >
              <MenuItem onClick={() => setMarkErrorId(r.internalId)}>
                Mark as error
              </MenuItem>
            </Menu>
          )}
        </td>
      </tr>
    ));
  };

  return (
    <main className="prime-home">
      <div className="grid-container">
        <div className="grid-row">
          <div className="prime-container usa-card__container sr-test-results-list">
            <div className="usa-card__header">
              <h2>Test Results</h2>
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
                <tbody>{testResultRows()}</tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

const TestResultsList = (props: Omit<Props, InjectedQueryWrapperProps>) => (
  <QueryWrapper<Props>
    query={testResultQuery}
    queryOptions={{
      variables: { facilityId: props.activeFacilityId },
    }}
    Component={DetachedTestResultsList}
    componentProps={{ ...props }}
  />
);

export default TestResultsList;
