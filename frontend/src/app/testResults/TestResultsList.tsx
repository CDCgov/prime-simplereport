import { gql } from "@apollo/client";
import React, { useRef, useState } from "react";
import { useSelector } from "react-redux";
import moment from "moment";
import classnames from "classnames";

import { PATIENT_TERM_CAP } from "../../config/constants";
import { displayFullName } from "../utils";
import {
  InjectedQueryWrapperProps,
  QueryWrapper,
} from "../commonComponents/QueryWrapper";
import { ActionsMenu } from "../commonComponents/ActionsMenu";

import TestResultPrintModal from "./TestResultPrintModal";
import TestResultCorrectionModal from "./TestResultCorrectionModal";
import "./TestResultsList.scss";

const testResultQuery = gql`
  query GetFacilityResults($facilityId: ID!, $newerThanDate: DateTime) {
    testResults(facilityId: $facilityId, newerThanDate: $newerThanDate) {
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
        birthDate
        gender
        lookupId
      }
    }
  }
`;

interface Props {
  showAll: boolean;
  setShowAll: (state: boolean) => void;
  data: any;
  trackAction: () => void;
  refetch: () => void;
}

export const DetachedTestResultsList: any = ({
  data,
  showAll,
  setShowAll,
  refetch,
}: Props) => {
  const [printModalId, setPrintModalId] = useState(undefined);
  const [markErrorId, setMarkErrorId] = useState(undefined);
  const showMoreButton = useRef<HTMLButtonElement>(null);

  const showCompleteResults = () => {
    if (showMoreButton.current) {
      showMoreButton.current.disabled = true;
    }
    setShowAll(true);
  };

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

    // `sort` mutates the array, so make a copy
    return [...testResults].sort(byDateTested).map((r) => {
      const removed = r.correctionStatus === "REMOVED";
      const actionItems = [
        { name: "Print result", action: () => setPrintModalId(r.internalId) },
      ];
      if (!removed) {
        actionItems.push({
          name: "Mark as error",
          action: () => setMarkErrorId(r.internalId),
        });
      }
      return (
        <tr
          key={r.internalId}
          title={removed ? "Marked as error" : ""}
          className={classnames(
            "sr-test-result-row",
            removed && "sr-test-result-row--removed"
          )}
        >
          <th scope="row">
            {displayFullName(
              r.patient.firstName,
              r.patient.middleName,
              r.patient.lastName
            )}
          </th>
          <td>{moment(r.dateTested).format("lll")}</td>
          <td>{r.result}</td>
          <td>{r.deviceType.name}</td>
          <td>
            <ActionsMenu items={actionItems} />
          </td>
        </tr>
      );
    });
  };

  return (
    <main className="prime-home">
      <div className="grid-container">
        <div className="grid-row">
          <div className="prime-container usa-card__container sr-test-results-list">
            <div className="usa-card__header">
              <h2>Test Results {showAll ? "(all)" : "(past two days)"}</h2>
            </div>
            <div className="usa-card__body">
              <table className="usa-table usa-table--borderless width-full">
                <thead>
                  <tr>
                    <th scope="col">{PATIENT_TERM_CAP} Name</th>
                    <th scope="col">Date of Test</th>
                    <th scope="col">Result</th>
                    <th scope="col">Device</th>
                    <th scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody>{testResultRows()}</tbody>
              </table>
            </div>
            {!showAll && (
              <div className="sr-more-test-results">
                <button
                  className="usa-button"
                  ref={showMoreButton}
                  onClick={showCompleteResults}
                >
                  See all results
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

const TestResultsList = (
  props: Omit<Props, InjectedQueryWrapperProps | "showAll" | "setShowAll">
) => {
  const [showAll, setShowAll] = useState(false);
  const activeFacilityId = useSelector(
    (state) => (state as any).facility.id as string
  );

  if (activeFacilityId.length < 1) {
    return <div>"No facility selected"</div>;
  }

  // This gives us midnight of the previous day
  const startDate = moment().subtract(1, "day").format("YYYY-MM-DD");
  return (
    <QueryWrapper<Props>
      query={testResultQuery}
      queryOptions={{
        variables: {
          facilityId: activeFacilityId,
          newerThanDate: showAll ? null : startDate,
        },
      }}
      Component={DetachedTestResultsList}
      componentProps={{ ...props, showAll, setShowAll }}
    />
  );
};

export default TestResultsList;
