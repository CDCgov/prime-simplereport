import React from "react";
import Modal from "react-modal";
import classnames from "classnames";
import { Trans, useTranslation } from "react-i18next";

import Button from "../commonComponents/Button/Button";
import CovidResultGuidance from "../commonComponents/CovidResultGuidance";
import { displayFullName } from "../utils";
import "./TestResultPrintModal.scss";
import logo from "../../img/simplereport-logo-black.svg";
import { QueryWrapper } from "../commonComponents/QueryWrapper";
import LanguageToggler from "../../patientApp/LanguageToggler";
import { formatDateWithTimeOption } from "../utils/date";
import { GetTestResultForPrintDocument } from "../../generated/graphql";
import { MultiplexResult } from "../testQueue/QueueItem";

interface OrderingProvider {
  firstName: string;
  middleName: string;
  lastName: string;
  npi?: string | null;
  NPI?: string | null;
}

interface Patient {
  firstName: string;
  middleName: string;
  lastName: string;
  birthDate: string;
}

interface Facility extends Address {
  name: string;
  phone: string;
  cliaNumber: string;
  orderingProvider: OrderingProvider;
}

export interface TestResult {
  correctionStatus: string;
  dateTested: string;
  deviceType: {
    model: string;
    name: string;
  };
  facility: Facility;
  patient: Patient;
  results: MultiplexResult[];
}

interface StaticTestResultModalProps {
  testResultId: string | undefined;
  testResult: TestResult;
  hardcodedPrintDate?: string;
}

export const StaticTestResultModal = ({
  testResultId,
  testResult,
  hardcodedPrintDate,
}: StaticTestResultModalProps) => {
  const { t } = useTranslation();
  const {
    patient,
    facility,
    deviceType,
    correctionStatus,
    results,
    dateTested,
  } = testResult;

  const multiplexEnabled = process.env.REACT_APP_MULTIPLEX_ENABLED === "true";
  const getSortedResults = () => {
    return Object.values(results).sort(
      (a: MultiplexResult, b: MultiplexResult) => {
        return a.disease.name.localeCompare(b.disease.name);
      }
    );
  };

  const hasMultiplexResults = Object.values(results).some(
    (multiplexResult: MultiplexResult) =>
      multiplexResult.disease.name !== "COVID-19"
  );

  const getCovidResult = Object.values(
    results
  ).filter((multiplexResult: MultiplexResult) =>
    multiplexResult.disease.name.includes("COVID-19")
  );

  const hasPositiveFluResults =
    Object.values(results).filter(
      (multiplexResult: MultiplexResult) =>
        (multiplexResult.disease.name.includes("Flu") &&
          multiplexResult.testResult === "POSITIVE") ||
        multiplexResult.result === "POSITIVE"
    ).length > 0;

  const setCovidGuidance = (result?: string) => {
    return (
      <div
        className={
          multiplexEnabled && hasMultiplexResults && hasPositiveFluResults
            ? "sr-margin-bottom-28px"
            : ""
        }
      >
        {multiplexEnabled && hasPositiveFluResults && (
          <p className="text-bold sr-guidance-heading">
            {t("testResult.notes.h1")}
          </p>
        )}
        {result === "UNDETERMINED" && (
          <CovidResultGuidance result={"UNDETERMINED"} isPatientApp={false} />
        )}
        {result !== "POSITIVE" && (
          <>
            <CovidResultGuidance result={"NEGATIVE"} isPatientApp={false} />
            <Trans
              t={t}
              parent="p"
              i18nKey="testResult.notes.negative.moreInformation"
              components={[
                <a
                  href={t("testResult.cdcLink")}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  cdc.gov
                </a>,
              ]}
            />
          </>
        )}
        {result === "POSITIVE" && (
          <>
            <CovidResultGuidance result={"POSITIVE"} isPatientApp={false} />
            <Trans
              t={t}
              parent="p"
              i18nKey="testResult.information"
              components={[
                <a
                  href={t("testResult.cdcLink")}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  cdc.gov
                </a>,
                <a
                  href={t("testResult.countyCheckToolLink")}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  county check tool
                </a>,
              ]}
            />
          </>
        )}
      </div>
    );
  };

  const setPositiveFluGuidance = () => {
    return (
      <>
        {multiplexEnabled && hasPositiveFluResults && (
          <p className="text-bold sr-guidance-heading">
            {t("testResult.fluNotes.h1")}
          </p>
        )}
        <p>{t("testResult.fluNotes.positive.p0")}</p>
        <Trans
          t={t}
          parent="p"
          i18nKey="testResult.fluNotes.positive.p1"
          components={[
            <a
              href={t("testResult.fluNotes.positive.highRiskLink")}
              target="_blank"
              rel="noopener noreferrer"
            >
              flu high risk link
            </a>,
          ]}
        />
        <Trans
          t={t}
          parent="p"
          i18nKey="testResult.fluNotes.positive.p2"
          components={[
            <a
              href={t("testResult.fluNotes.positive.treatmentLink")}
              target="_blank"
              rel="noopener noreferrer"
            >
              flu treatment link
            </a>,
          ]}
        />
      </>
    );
  };

  const testResultsList = () => {
    const sortedTestResults = multiplexEnabled
      ? getSortedResults()
      : getCovidResult;
    const testResultsArray: any = [];
    sortedTestResults.forEach((sortedTestResult: MultiplexResult) => {
      const sortedResult =
        sortedTestResult.testResult || sortedTestResult.result;
      testResultsArray.push(
        <li>
          <b>
            {sortedTestResult.disease.name === "COVID-19" &&
              t("constants.disease.COVID19")}
            {sortedTestResult.disease.name === "Flu A" &&
              t("constants.disease.FLUA")}
            {sortedTestResult.disease.name === "Flu B" &&
              t("constants.disease.FLUB")}
          </b>
          <div>
            <strong>
              <span>
                {sortedResult === "POSITIVE" &&
                  t("constants.testResults.POSITIVE")}
                {sortedResult === "NEGATIVE" &&
                  t("constants.testResults.NEGATIVE")}
                {sortedResult === "UNDETERMINED" &&
                  t("constants.testResults.UNDETERMINED")}
              </span>
              <span>
                &nbsp;
                {sortedResult === "POSITIVE" &&
                  t("constants.testResultsSymbols.POSITIVE")}
                {sortedResult === "NEGATIVE" &&
                  t("constants.testResultsSymbols.NEGATIVE")}
              </span>
            </strong>
          </div>
        </li>
      );
    });
    return testResultsArray;
  };

  const testResultsGuidance = () => {
    const testGuidanceArray: any = [];
    const covidGuidanceElement = setCovidGuidance(
      getCovidResult[0].testResult || getCovidResult[0].result
    );
    testGuidanceArray.push(covidGuidanceElement);
    if (multiplexEnabled && hasPositiveFluResults) {
      testGuidanceArray.push(setPositiveFluGuidance());
    }
    return testGuidanceArray;
  };

  return (
    <div
      className={classnames(
        "sr-test-result-report",
        correctionStatus === "REMOVED" && "sr-removed-result"
      )}
    >
      <header className="display-flex flex-align-end flex-justify margin-bottom-1">
        <h1>
          {multiplexEnabled && hasMultiplexResults
            ? t("testResult.multiplexResultHeader")
            : t("testResult.covidResultHeader")}
        </h1>
        <img alt="SimpleReport logo" src={logo} className="sr-print-logo" />
      </header>
      <main>
        <section className="sr-result-section sr-result-patient-details">
          <h2>{t("testResult.patientDetails")}</h2>
          <ul className="sr-details-list">
            <li>
              <b>{t("testResult.name")}</b>
              <div>
                {displayFullName(
                  patient.firstName,
                  patient.middleName,
                  patient.lastName,
                  false
                )}
              </div>
            </li>
            <li>
              <b>{t("testResult.dob.dateOfBirth")}</b>
              <div>{formatDateWithTimeOption(patient.birthDate)}</div>
            </li>
          </ul>
        </section>
        <section className="sr-result-section sr-result-facility-details">
          <h2>{t("testResult.testingFacility.details")}</h2>
          <ul className="sr-details-list">
            <li>
              <b>{t("testResult.testingFacility.name")}</b>
              <div>{facility.name}</div>
            </li>
            <li>
              <b>{t("testResult.testingFacility.phone")}</b>
              <div>{facility.phone}</div>
            </li>
            <li>
              <b>{t("testResult.testingFacility.address")}</b>
              <div className="sr-result-facility-details-address">
                <span>{facility.street}</span>
                {facility.streetTwo && <span>{facility.streetTwo}</span>}
                <span>
                  {facility.city}, {facility.state} {facility.zipCode}
                </span>
              </div>
            </li>
            <li>
              <b>{t("testResult.testingFacility.clia")}</b>
              <div>{facility.cliaNumber}</div>
            </li>
            <li>
              <b>{t("testResult.testingFacility.orderingProvider")}</b>
              <div>
                {displayFullName(
                  facility.orderingProvider.firstName,
                  facility.orderingProvider.middleName,
                  facility.orderingProvider.lastName,
                  false
                )}
              </div>
            </li>
            <li>
              <b>{t("testResult.testingFacility.npi")}</b>
              <div>
                {facility.orderingProvider.NPI || facility.orderingProvider.npi}
              </div>
            </li>
          </ul>
        </section>
        <section className="sr-result-section sr-result-test-details">
          <h2>{t("testResult.testDetails")}</h2>
          <ul className="sr-details-list">
            <li>
              <b>{t("testResult.id")}</b>
              <div>{testResultId}</div>
            </li>
            <li>
              <b>{t("testResult.testName")}</b>
              <div>{deviceType.name}</div>
            </li>
            <li>
              <b>{t("testResult.testDevice")}</b>
              <div>{deviceType.model}</div>
            </li>
            <li className="sr-margin-bottom-28px">
              <b>{t("testResult.testDate")}</b>
              <div>{formatDateWithTimeOption(dateTested, true)}</div>
            </li>
            {testResultsList()}
          </ul>
        </section>
        <section className="sr-result-section sr-result-next-steps">
          <h2>{t("testResult.moreInformation")}</h2>
          {testResultsGuidance()}
        </section>
      </main>
      <footer>
        <p>
          {t("testResult.printed")}{" "}
          {hardcodedPrintDate || new Date().toLocaleString()}
        </p>
      </footer>
    </div>
  );
};

export interface TestResultPrintModalProps {
  data: any; // testQuery result
  testResultId: string | undefined;
  closeModal: () => void;
  hardcodedPrintDate?: string;
}

export const DetachedTestResultPrintModal = ({
  testResultId,
  data,
  closeModal,
  hardcodedPrintDate,
}: TestResultPrintModalProps) => {
  const { t } = useTranslation();

  const buttonGroup = (
    <div className="sr-result-print-buttons dont-print">
      <Button
        variant="unstyled"
        label={t("testResult.close")}
        onClick={closeModal}
      />
      <Button label={t("testResult.print")} onClick={() => window.print()} />
    </div>
  );

  return (
    <Modal
      isOpen={true}
      className="sr-test-results-modal-content"
      overlayClassName="sr-test-results-modal-overlay"
      contentLabel="Printable test result"
    >
      <div className="display-flex flex-align-center maxw-tablet grid-container patient-header padding-x-0 dont-print">
        <LanguageToggler />
        {buttonGroup}
      </div>
      <StaticTestResultModal
        testResultId={testResultId}
        testResult={data.testResult}
        hardcodedPrintDate={hardcodedPrintDate}
      />
      {buttonGroup}
    </Modal>
  );
};

const TestResultPrintModal = (
  props: Omit<TestResultPrintModalProps, "data">
) => (
  <QueryWrapper<TestResultPrintModalProps>
    query={GetTestResultForPrintDocument}
    queryOptions={{ variables: { id: props.testResultId } }}
    Component={DetachedTestResultPrintModal}
    componentProps={{ ...props }}
  />
);

export default TestResultPrintModal;
