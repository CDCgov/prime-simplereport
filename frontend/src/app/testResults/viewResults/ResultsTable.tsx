import React, { Dispatch, SetStateAction, useState } from "react";
import classnames from "classnames";
import moment from "moment";

import { PATIENT_TERM_CAP } from "../../../config/constants";
import { TEST_RESULT_DESCRIPTIONS } from "../../constants";
import Button from "../../commonComponents/Button/Button";
import { displayFullName, facilityDisplayName } from "../../utils";
import { formatDateWithTimeOption } from "../../utils/date";
import { ActionsMenu } from "../../commonComponents/ActionsMenu";
import { toLowerCaseHyphenate } from "../../utils/text";
import { PhoneNumber, Maybe, Result } from "../../../generated/graphql";
import { waitForElement } from "../../utils/elements";

import { byDateTested } from "./TestResultsList";
import TestResultPrintModal from "./actionMenuModals/TestResultPrintModal";
import TestResultTextModal from "./actionMenuModals/TestResultTextModal";
import EmailTestResultModal from "./actionMenuModals/EmailTestResultModal";
import TestResultCorrectionModal from "./actionMenuModals/TestResultCorrectionModal";
import TestResultDetailsModal from "./actionMenuModals/TestResultDetailsModal";

export const TEST_RESULT_ARIA_TIME_FORMAT = "MMMM Do YYYY, h:mm:ss a";

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
  return `Click for more detailed results information for ${patientFullName} reported on ${displayPatientDate}`;
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
  onActionSelect: Dispatch<SetStateAction<ActionInformation>>,
  r: Result,
  removed: boolean
) {
  const actionItems = [];
  actionItems.push({
    name: "Print result",
    action: () => onActionSelect({ modalType: "PRINT", testResult: r }),
  });
  if (r.patient?.email) {
    actionItems.push({
      name: "Email result",
      action: () => onActionSelect({ modalType: "EMAIL", testResult: r }),
    });
  }

  if (
    r.patient?.phoneNumbers?.some(
      (pn: Maybe<PhoneNumber>) => pn?.type === "MOBILE"
    )
  ) {
    actionItems.push({
      name: "Text result",
      action: () => onActionSelect({ modalType: "TEXT", testResult: r }),
    });
  }

  if (!removed) {
    actionItems.push({
      name: "Correct result",
      action: () => onActionSelect({ modalType: "CORRECTION", testResult: r }),
    });
  }
  actionItems.push({
    name: "View details",
    action: () => onActionSelect({ modalType: "DETAILS", testResult: r }),
  });
  return actionItems;
}

const generateResultRows = (
  testResults: Array<Result>,
  onActionSelect: Dispatch<SetStateAction<ActionInformation>>,
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

    let diseaseIdName = toLowerCaseHyphenate(r.disease);
    const actionItems = createActionItemList(onActionSelect, r, removed);
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
            onClick={() =>
              onActionSelect({
                modalType: "DETAILS TRIGGERED FROM NAME LINK",
                testResult: r,
              })
            }
            className="sr-link__primary"
          />
          <span className="display-block text-base font-ui-2xs">
            DOB: {formatDateWithTimeOption(r.patient?.birthDate)}
          </span>
        </td>
        <td className="test-date-cell">
          {formatDateWithTimeOption(r.dateTested, true)}
        </td>
        <td className="test-condition-cell">{r.disease}</td>
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
              r.facility?.name,
              r.facility?.isDeleted as boolean
            )}
          </td>
        )}
        <td className="actions-cell">
          <ActionsMenu items={actionItems} id={r.id} />
        </td>
      </tr>
    );
  });
};

interface ResultsTableListProps {
  results: Array<Result>;
  hasFacility: boolean;
}

type ActionInformation = {
  modalType:
    | "NONE"
    | "PRINT"
    | "CORRECTION"
    | "TEXT"
    | "DETAILS"
    | "EMAIL"
    | "DETAILS TRIGGERED FROM NAME LINK";
  testResult: Result | undefined;
};

const ResultsTable = ({ results, hasFacility }: ResultsTableListProps) => {
  /**
   * Modals and selected test result handlers
   */

  const [actionSelected, setActionSelected] = useState<ActionInformation>({
    modalType: "NONE",
    testResult: undefined,
  });

  const dismissModal = () => {
    setActionSelected(
      (prevState): ActionInformation => ({ ...prevState, modalType: "NONE" })
    );
  };

  const setFocusOnActionMenu = (actionName: string) => {
    const buttonSelector = `#action_${actionSelected?.testResult?.id}`;
    const printButtonSelector = `#${actionName}_${actionSelected?.testResult?.id}`;
    waitForElement(buttonSelector).then((actionButton) => {
      (actionButton as HTMLElement)?.click();
      waitForElement(printButtonSelector).then((printButton) => {
        (printButton as HTMLElement)?.focus();
        const event = new MouseEvent("mouseover", {
          view: window,
          bubbles: true,
          cancelable: true,
        });
        printButton?.dispatchEvent(event);
      });
    });
  };

  /**
   * HTML
   */

  return (
    <div title="filtered-result">
      <table className="usa-table usa-table--borderless width-full">
        <thead className="sr-element__sr-only">
          {generateTableHeaders(hasFacility)}
        </thead>
        <tbody data-testid={"filtered-results"}>
          {generateResultRows(results, setActionSelected, hasFacility)}
        </tbody>
      </table>
      <TestResultPrintModal
        isOpen={actionSelected.modalType === "PRINT"}
        testResultId={actionSelected?.testResult?.id as string}
        closeModal={() => {
          setFocusOnActionMenu("print");
          dismissModal();
        }}
      />
      <TestResultTextModal
        isOpen={actionSelected.modalType === "TEXT"}
        testResultId={actionSelected?.testResult?.id as string}
        closeModal={() => {
          setFocusOnActionMenu("text");
          dismissModal();
        }}
      />
      <EmailTestResultModal
        isOpen={actionSelected.modalType === "EMAIL"}
        testResultId={actionSelected?.testResult?.id as string}
        closeModal={() => {
          setFocusOnActionMenu("email");
          dismissModal();
        }}
      />
      <TestResultCorrectionModal
        isOpen={actionSelected.modalType === "CORRECTION"}
        testResultId={actionSelected?.testResult?.id as string}
        isFacilityDeleted={
          results.find(
            (result) => result?.id === actionSelected?.testResult?.id
          )?.facility?.isDeleted ?? false
        }
        closeModal={() => {
          setFocusOnActionMenu("correct");
          dismissModal();
        }}
      />
      <TestResultDetailsModal
        isOpen={
          actionSelected.modalType === "DETAILS" ||
          actionSelected.modalType === "DETAILS TRIGGERED FROM NAME LINK"
        }
        testResult={actionSelected.testResult}
        closeModal={() => {
          if (actionSelected.modalType === "DETAILS") {
            setFocusOnActionMenu("view");
          }
          dismissModal();
        }}
      />
    </div>
  );
};

export default ResultsTable;
