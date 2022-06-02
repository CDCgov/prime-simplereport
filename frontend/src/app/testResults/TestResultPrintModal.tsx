import React from "react";
import Modal from "react-modal";
import classnames from "classnames";
import { Trans, useTranslation } from "react-i18next";

import Button from "../commonComponents/Button/Button";
import { displayFullName } from "../utils";
import "./TestResultPrintModal.scss";
import logo from "../../img/simplereport-logo-black.svg";
import { QueryWrapper } from "../commonComponents/QueryWrapper";
import LanguageToggler from "../../patientApp/LanguageToggler";
import { formatDateWithTimeOption } from "../utils/date";
import { GetTestResultForPrintDocument } from "../../generated/graphql";

interface StaticTestResultModalProps {
  testResultId: string | undefined;
  testResult: any;
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

  const getSortedResults = () => {
    return Object.values(results).sort((a: any, b: any) => {
      return a.disease.name.localeCompare(b.disease.name);
    });
  };

  const hasMultiplexResults = results.some(
    (multiplexResult: any) => multiplexResult.disease.name !== "COVID-19"
  );

  const getCovidResult = results.filter((multiplexResult: any) =>
    multiplexResult.disease.name.includes("COVID-19")
  )[0];

  const hasPositiveFluResults =
    results.filter(
      (multiplexResult: any) =>
        multiplexResult.disease.name.includes("Flu") &&
        multiplexResult.testResult === "POSITIVE"
    ).length > 0;

  const isMultiplexWithPositiveCovidOrNoFlu =
    hasMultiplexResults &&
    (!hasPositiveFluResults || getCovidResult.testResult === "POSITIVE");

  const setCovidGuidance = (result: string) => {
    return (
      <div
        className={
          hasMultiplexResults && hasPositiveFluResults
            ? "sr-margin-bottom-28px"
            : ""
        }
      >
        {hasMultiplexResults && hasPositiveFluResults && (
          <p className="text-bold sr-guidance-heading">
            {t("testResult.notes.h1")}
          </p>
        )}
        {result === "UNDETERMINED" && (
          <p>{t("testResult.notes.inconclusive.p0")}</p>
        )}
        {result !== "POSITIVE" &&
          (isMultiplexWithPositiveCovidOrNoFlu || !hasMultiplexResults) && (
            <>
              <p>{t("testResult.notes.negative.p0")}</p>
              <ul className="sr-multi-column">
                <li>{t("testResult.notes.negative.symptoms.li2")}</li>
                <li>{t("testResult.notes.negative.symptoms.li3")}</li>
                <li>{t("testResult.notes.negative.symptoms.li4")}</li>
                <li>{t("testResult.notes.negative.symptoms.li5")}</li>
                <li>{t("testResult.notes.negative.symptoms.li6")}</li>
                <li>{t("testResult.notes.negative.symptoms.li7")}</li>
                <li>{t("testResult.notes.negative.symptoms.li8")}</li>
                <li>{t("testResult.notes.negative.symptoms.li9")}</li>
                <li>{t("testResult.notes.negative.symptoms.li10")}</li>
              </ul>
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
            <p>{t("testResult.notes.positive.p1")}</p>
            <ul>
              <li>{t("testResult.notes.positive.guidelines.li0")}</li>
              <li>{t("testResult.notes.positive.guidelines.li1")}</li>
              <li>{t("testResult.notes.positive.guidelines.li2")}</li>
              <li>{t("testResult.notes.positive.guidelines.li3")}</li>
              <li>{t("testResult.notes.positive.guidelines.li4")}</li>
              <li>{t("testResult.notes.positive.guidelines.li5")}</li>
            </ul>
            <Trans
              t={t}
              parent="p"
              i18nKey="testResult.notes.positive.p2"
              components={[
                <a
                  href={t("testResult.notes.positive.symptomsLink")}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  symptoms link
                </a>,
              ]}
            />
            <ul>
              <li>{t("testResult.notes.positive.emergency.li0")}</li>
              <li>{t("testResult.notes.positive.emergency.li1")}</li>
              <li>{t("testResult.notes.positive.emergency.li2")}</li>
              <li>{t("testResult.notes.positive.emergency.li3")}</li>
              <li>{t("testResult.notes.positive.emergency.li4")}</li>
            </ul>
            <p>{t("testResult.notes.positive.p3")}</p>
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
        {getCovidResult.testResult === "POSITIVE" && (
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
    const sortedTestResults = getSortedResults();
    const testResultsArray: any = [];
    sortedTestResults.forEach((sortedTestResult: any) => {
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
                {sortedTestResult.testResult === "POSITIVE" &&
                  t("constants.testResults.POSITIVE")}
                {sortedTestResult.testResult === "NEGATIVE" &&
                  t("constants.testResults.NEGATIVE")}
                {sortedTestResult.testResult === "UNDETERMINED" &&
                  t("constants.testResults.UNDETERMINED")}
              </span>
              <span>
                &nbsp;
                {sortedTestResult.testResult === "POSITIVE" &&
                  t("constants.testResultsSymbols.POSITIVE")}
                {sortedTestResult.testResult === "NEGATIVE" &&
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
    let testGuidanceArray: any = [];

    if (isMultiplexWithPositiveCovidOrNoFlu || !hasMultiplexResults) {
      let covidGuidanceElement = setCovidGuidance(getCovidResult.testResult);
      testGuidanceArray.push(covidGuidanceElement);
    }
    if (hasPositiveFluResults) {
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
          {hasMultiplexResults
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
              <div>{facility.orderingProvider.NPI}</div>
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
