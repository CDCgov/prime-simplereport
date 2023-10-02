import React, { Dispatch, SetStateAction } from "react";
import classnames from "classnames";
import moment from "moment";

import { PATIENT_TERM_CAP } from "../../../config/constants";
import { TEST_RESULT_DESCRIPTIONS } from "../../constants";
import Button from "../../commonComponents/Button/Button";
import { displayFullName, facilityDisplayName } from "../../utils";
import { formatDateWithTimeOption } from "../../utils/date";
import { ActionsMenu } from "../../commonComponents/ActionsMenu";
import { byDateTested } from "../TestResultsList";
import { MULTIPLEX_DISEASES } from "../constants";
import { toLowerCaseHyphenate } from "../../utils/text";
import { PhoneNumber, Maybe, Result } from "../../../generated/graphql";

export const TEST_RESULT_ARIA_TIME_FORMAT = "MMMM Do YYYY, h:mm:ss a";

const testResultOrdering = [
  MULTIPLEX_DISEASES.COVID_19,
  MULTIPLEX_DISEASES.FLU_A,
  MULTIPLEX_DISEASES.FLU_B,
];

// TODO: hmmmm.... wut do
const sortTestResults = (results: MultiplexResults) => {
  return [...results].sort(
    (a, b) =>
      testResultOrdering.indexOf(a.disease.name) -
      testResultOrdering.indexOf(b.disease.name)
  );
};

export function formatTestResultAriaLabel(result: Result) {
  const patientFullName = displayFullName(
    result.patient?.firstName,
    result.patient?.middleName,
    result.patient?.lastName
  );

  const displayPatientDate =
    result.correctionStatus === "ORIGINAL"
      ? moment(result.dateTested).format(TEST_RESULT_ARIA_TIME_FORMAT)
      : moment(result.dateUpdated).format(TEST_RESULT_ARIA_TIME_FORMAT);
  return `Click for more detailed results information for ${patientFullName} conducted on ${displayPatientDate}`;
}

export const generateTableHeaders = (hasFacility: boolean) => (
  <tr>
    <th scope="col" className="patient-name-cell">
      {PATIENT_TERM_CAP}
    </th>
    <th scope="col" className="test-date-cell">
      Test date
    </th>
    <th scope="col" className="test-condition-cell">
      Condition
    </th>
    <th scope="col" className="test-result-cell">
      Result
    </th>
    <th scope="col" className="test-device-cell">
      Test device
    </th>
    {hasFacility ? null : (
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

function createActionItemList(
  setPrintModalId: Dispatch<SetStateAction<Maybe<string> | undefined>>,
  r: Result,
  setEmailModalTestResultId: Dispatch<
    SetStateAction<Maybe<string> | undefined>
  >,
  setTextModalId: Dispatch<SetStateAction<Maybe<string> | undefined>>,
  removed: boolean,
  setMarkCorrectionId: Dispatch<SetStateAction<Maybe<string> | undefined>>,
  setDetailsModalId: Dispatch<SetStateAction<Maybe<string> | undefined>>
) {
  const actionItems = [];
  actionItems.push({
    name: "Print result",
    action: () => setPrintModalId(r.id),
  });
  if (r.patient?.email) {
    actionItems.push({
      name: "Email result",
      action: () => setEmailModalTestResultId(r.id),
    });
  }

  if (
    r.patient?.phoneNumbers?.some(
      (pn: Maybe<PhoneNumber>) => pn?.type === "MOBILE"
    )
  ) {
    actionItems.push({
      name: "Text result",
      action: () => setTextModalId(r.id),
    });
  }

  if (!removed) {
    actionItems.push({
      name: "Correct result",
      action: () => setMarkCorrectionId(r.id),
    });
  }
  actionItems.push({
    name: "View details",
    action: () => setDetailsModalId(r.id),
  });
  return actionItems;
}

const generateResultRows = (
  testResults: Array<Result>,
  setPrintModalId: Dispatch<SetStateAction<Maybe<string> | undefined>>,
  setMarkCorrectionId: Dispatch<SetStateAction<Maybe<string> | undefined>>,
  setDetailsModalId: Dispatch<SetStateAction<Maybe<string> | undefined>>,
  setTextModalId: Dispatch<SetStateAction<Maybe<string> | undefined>>,
  setEmailModalTestResultId: Dispatch<
    SetStateAction<Maybe<string> | undefined>
  >,
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

  const sortedResults = [...testResults].sort(byDateTested);

  return sortedResults.map((r: Result) => {
    const removed = r.correctionStatus === "REMOVED";
    // TODO: values are required; update to reflect
    let diseaseIdName = toLowerCaseHyphenate(r?.disease?.name);
    const actionItems = createActionItemList(
      setPrintModalId,
      r,
      setEmailModalTestResultId,
      setTextModalId,
      removed,
      setMarkCorrectionId,
      setDetailsModalId
    );
    const getResultCellHTML = () => {
      return (
        <td
          key={`${r.id}-${diseaseIdName}`}
          className="test-result-cell"
          data-testid={`${diseaseIdName}-result`}
        >
          {r.testResult ? TEST_RESULT_DESCRIPTIONS[r.testResult] : "N/A"}
        </td>
      );
    };
    return (
      <tr
        key={`${r.id}-${diseaseIdName}`}
        title={removed ? "Marked as error" : ""}
        className={classnames(
          "sr-test-result-row",
          removed && "sr-test-result-row--removed"
        )}
        data-testid={`test-result-${r.id}-${diseaseIdName}`}
        data-patient-link={null}
        /*
        data-patient-link={
          r.testOrder.patientLink
            ? `${getUrl()}pxp?plid=${r.testOrder.patientLink.internalId}`
            : null
        }
         */
      >
        <td className="patient-name-cell">
          <Button
            variant="unstyled"
            ariaLabel={formatTestResultAriaLabel(r)}
            label={displayFullName(
              r.patient?.firstName,
              r.patient?.middleName,
              r.patient?.lastName
            )}
            onClick={() => setDetailsModalId(r.id)}
            className="sr-link__primary"
          />
          <span className="display-block text-base font-ui-2xs">
            DOB: {formatDateWithTimeOption(r.patient?.birthDate)}
          </span>
        </td>
        <td className="test-date-cell">
          {formatDateWithTimeOption(r.dateTested, true)}
        </td>
        <td className="test-condition-cell">{r.disease.name}</td>
        {getResultCellHTML()}
        <td className="test-device-cell">{r.deviceType?.name}</td>
        {!hasFacility ? (
          <td className="submitted-by-cell">
            {displayFullName(
              r.createdBy?.nameInfo?.firstName,
              null,
              r.createdBy?.nameInfo?.lastName
            )}
          </td>
        ) : (
          <td className="test-facility-cell">
            {facilityDisplayName(
              r.facility?.name as string,
              r.facility?.isDeleted as boolean
            )}
          </td>
        )}
        <td className="actions-cell">
          <ActionsMenu items={actionItems} id={r.id as string} />
        </td>
      </tr>
    );
  });
};

interface ResultsTableListProps {
  results: Array<Result>;
  setPrintModalId: Dispatch<SetStateAction<Maybe<string> | undefined>>;
  setMarkCorrectionId: Dispatch<SetStateAction<Maybe<string> | undefined>>;
  setDetailsModalId: Dispatch<SetStateAction<Maybe<string> | undefined>>;
  setTextModalId: Dispatch<SetStateAction<Maybe<string> | undefined>>;
  setEmailModalTestResultId: Dispatch<
    SetStateAction<Maybe<string> | undefined>
  >;
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
        {generateTableHeaders(hasFacility)}
      </thead>
      <tbody data-testid={"filtered-results"}>
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
