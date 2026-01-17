import React from "react";
import Modal from "react-modal";
import classnames from "classnames";
import { useTranslation } from "react-i18next";

import Button from "../../../commonComponents/Button/Button";
import TestResultsList from "../../../commonComponents/TestResultsList";
import ResultsGuidance from "../../../commonComponents/TestResultGuidance/ResultsGuidance";
import "./TestResultPrintModal.scss";
import logo from "../../../../img/simplereport-logo-black.svg";
import { QueryWrapper } from "../../../commonComponents/QueryWrapper";
import LanguageToggler from "../../../../patientApp/LanguageToggler";
import { GetTestResultForPrintDocument } from "../../../../generated/graphql";
import { displayFullName } from "../../../utils";
import { formatDateWithTimeOption } from "../../../utils/date";
import {
  getGuidanceForResults,
  hasMultipleResults,
} from "../../../utils/testResults";
import { setLanguage } from "../../../utils/languages";

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
  results: MultiplexResults;
}

interface StaticTestResultModalProps {
  testResultId: string;
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
  const isPatientApp = false;
  const guidance = getGuidanceForResults(results, isPatientApp);

  return (
    <div
      className={classnames(
        "sr-test-result-report",
        correctionStatus === "REMOVED" && "sr-removed-result"
      )}
    >
      <header className="display-flex flex-align-end flex-justify margin-bottom-1">
        <h1>
          {hasMultipleResults(results)
            ? t("testResult.multipleResultHeader")
            : t("testResult.singleResultHeader")}
        </h1>
        <img
          alt="SimpleReport logo"
          src={logo}
          className="sr-print-logo dont-print"
        />
        <h2 className="display-none sr-show-on-print">SimpleReport</h2>
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
                {facility.orderingProvider.NPI ?? facility.orderingProvider.npi}
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
            <TestResultsList results={results} isPatientApp={isPatientApp} />
          </ul>
        </section>
        {guidance.length > 0 && (
          <section className="sr-result-section sr-result-next-steps">
            <h2>{t("testResult.moreInformation")}</h2>
            <ResultsGuidance guidance={guidance} isPatientApp={isPatientApp} />
          </section>
        )}
      </main>
      <footer>
        <p>
          {t("testResult.printed")}{" "}
          {hardcodedPrintDate ?? new Date().toLocaleString()}
        </p>
      </footer>
    </div>
  );
};

interface DetachedTestResultPrintModalProps {
  data: any; // testQuery result
  testResultId: string;
  closeModal: () => void;
  hardcodedPrintDate?: string;
}

export const DetachedTestResultPrintModal = ({
  testResultId,
  data,
  closeModal,
  hardcodedPrintDate,
}: DetachedTestResultPrintModalProps) => {
  const { t } = useTranslation();

  const buttonGroup = (
    <div className="sr-result-print-buttons dont-print">
      <Button
        variant="unstyled"
        label={t("testResult.close")}
        onClick={() => {
          closeModal();
          setLanguage("en");
        }}
      />
      <Button label={t("testResult.print")} onClick={() => window.print()} />
    </div>
  );

  return (
    <>
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
    </>
  );
};

export type TestResultPrintModalProps = Omit<
  DetachedTestResultPrintModalProps,
  "data"
> & {
  isOpen: boolean;
};
const TestResultPrintModal = (props: TestResultPrintModalProps) => (
  <Modal
    isOpen={props.isOpen}
    className="sr-test-results-modal-content"
    overlayClassName="sr-test-results-modal-overlay sr-legacy-application"
    contentLabel="Printable test result"
    onRequestClose={props.closeModal}
  >
    {props.testResultId && (
      <QueryWrapper<DetachedTestResultPrintModalProps>
        query={GetTestResultForPrintDocument}
        queryOptions={{
          variables: { id: props.testResultId },
          fetchPolicy: "no-cache",
        }}
        Component={DetachedTestResultPrintModal}
        componentProps={{ ...props }}
      />
    )}
  </Modal>
);

export default TestResultPrintModal;
