import React, { SetStateAction } from "react";
import classnames from "classnames";

import { PATIENT_TERM_CAP } from "../../../config/constants";
import { TEST_RESULT_DESCRIPTIONS } from "../../constants";
import { getUrl } from "../../utils/url";
import Button from "../../commonComponents/Button/Button";
import { displayFullName, facilityDisplayName } from "../../utils";
import { formatDateWithTimeOption } from "../../utils/date";
import { ActionsMenu } from "../../commonComponents/ActionsMenu";
import { byDateTested, Results } from "../TestResultsList";

export const generateTableHeaders = (
  hasMultiplexResults: boolean = false,
  hasFacility: boolean = false
) => (
  <tr>
    <th scope="col" className="patient-name-cell">
      {PATIENT_TERM_CAP}
    </th>
    <th scope="col" className="test-date-cell">
      Test date
    </th>
    <th scope="col" className="test-result-cell">
      COVID-19
    </th>
    {hasMultiplexResults ? (
      <>
        <th scope="col" className="test-result-cell">
          Flu A
        </th>
        <th scope="col" className="test-result-cell">
          Flu B
        </th>
      </>
    ) : null}
    <th scope="col" className="test-device-cell">
      Test device
    </th>
    {hasMultiplexResults && hasFacility ? null : (
      <th scope="col" className="submitted-by-cell">
        Submitted by
      </th>
    )}
    {hasFacility && (
      <th scope="col" className="test-facility-cell">
        Facility
      </th>
    )}
    <th scope="col" className="actions-cell">
      Actions
    </th>
  </tr>
);

const generateResultRows = (
  testResults: any,
  setPrintModalId: SetStateAction<any>,
  setMarkCorrectionId: SetStateAction<any>,
  setDetailsModalId: SetStateAction<any>,
  setTextModalId: SetStateAction<any>,
  setEmailModalTestResultId: SetStateAction<any>,
  hasMultiplexResults: boolean,
  hasFacility: boolean
) => {
  if (testResults.length === 0) {
    return (
      <tr>
        <td>No results</td>
      </tr>
    );
  }

  // `sort` mutates the array, so make a copy
  return [...testResults].sort(byDateTested).map((r) => {
    const actionItems = [];
    actionItems.push({
      name: "Print result",
      action: () => setPrintModalId(r.internalId),
    });
    if (r.patient.email) {
      actionItems.push({
        name: "Email result",
        action: () => setEmailModalTestResultId(r.internalId),
      });
    }
    actionItems.push({
      name: "Text result",
      action: () => setTextModalId(r.internalId),
    });

    const removed = r.correctionStatus === "REMOVED";
    if (!removed) {
      actionItems.push({
        name: "Correct result",
        action: () => setMarkCorrectionId(r.internalId),
      });
    }
    actionItems.push({
      name: "View details",
      action: () => setDetailsModalId(r.internalId),
    });
    const getResultCell = (disease: string) => {
      let result;
      if (r.results && r.results.length > 1) {
        result = r.results.find(
          (result: any) => result.disease.name === disease
        ).testResult;
      }
      if (result) {
        return TEST_RESULT_DESCRIPTIONS[result as Results];
      } else if (disease === "COVID-19") {
        return TEST_RESULT_DESCRIPTIONS[r.result as Results];
      } else {
        return "N/A";
      }
    };
    return (
      <tr
        key={r.internalId}
        title={removed ? "Marked as error" : ""}
        className={classnames(
          "sr-test-result-row",
          removed && "sr-test-result-row--removed"
        )}
        data-testid={`test-result-${r.internalId}`}
        data-patient-link={
          r.patientLink
            ? `${getUrl()}pxp?plid=${r.patientLink.internalId}`
            : null
        }
      >
        <td className="patient-name-cell">
          <Button
            variant="unstyled"
            label={displayFullName(
              r.patient.firstName,
              r.patient.middleName,
              r.patient.lastName
            )}
            onClick={() => setDetailsModalId(r.internalId)}
            className="sr-link__primary"
          />
          <span className="display-block text-base font-ui-2xs">
            DOB: {formatDateWithTimeOption(r.patient.birthDate)}
          </span>
        </td>
        <td className="test-date-cell">
          {formatDateWithTimeOption(r.dateTested, true)}
        </td>

        {hasMultiplexResults ? (
          <>
            <td className="test-result-cell covid-19-result">
              {getResultCell("COVID-19")}
            </td>
            <td className="test-result-cell flu-a-result">
              {getResultCell("Flu A")}
            </td>
            <td className="test-result-cell flu-b-result">
              {getResultCell("Flu B")}
            </td>
          </>
        ) : (
          <td className="test-result-cell covid-19-result">
            {getResultCell("COVID-19")}
          </td>
        )}
        <td className="test-device-cell">{r.deviceType.name}</td>
        {hasMultiplexResults && hasFacility ? null : (
          <td className="submitted-by-cell">
            {displayFullName(
              r.createdBy.nameInfo.firstName,
              null,
              r.createdBy.nameInfo.lastName
            )}
          </td>
        )}
        {hasFacility && (
          <td className="test-facility-cell">
            {facilityDisplayName(r.facility.name, r.facility.isDeleted)}
          </td>
        )}
        <td className="actions-cell">
          <ActionsMenu items={actionItems} />
        </td>
      </tr>
    );
  });
};

interface ResultsTableListProps {
  results: Array<any>;
  setPrintModalId: SetStateAction<any>;
  setMarkCorrectionId: SetStateAction<any>;
  setDetailsModalId: SetStateAction<any>;
  setTextModalId: SetStateAction<any>;
  setEmailModalTestResultId: SetStateAction<any>;
  hasMultiplexResults: boolean;
  hasFacility: boolean;
}

const ResultsTable = ({
  results,
  setPrintModalId,
  setMarkCorrectionId,
  setDetailsModalId,
  setTextModalId,
  setEmailModalTestResultId,
  hasMultiplexResults,
  hasFacility,
}: ResultsTableListProps) => {
  return (
    <table className="usa-table usa-table--borderless width-full">
      <thead className="sr-element__sr-only">
        {generateTableHeaders(hasMultiplexResults, hasFacility)}
      </thead>
      <tbody>
        {generateResultRows(
          results,
          setPrintModalId,
          setMarkCorrectionId,
          setDetailsModalId,
          setTextModalId,
          setEmailModalTestResultId,
          hasMultiplexResults,
          hasFacility
        )}
      </tbody>
    </table>
  );
};

export default ResultsTable;
