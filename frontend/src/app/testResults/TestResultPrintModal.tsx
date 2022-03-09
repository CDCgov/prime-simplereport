import React from "react";
import { gql } from "@apollo/client";
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

export const testQuery = gql`
  query getTestResultForPrint($id: ID!) {
    testResult(id: $id) {
      dateTested
      result
      correctionStatus
      deviceType {
        name
        model
      }
      patient {
        firstName
        middleName
        lastName
        birthDate
      }
      facility {
        name
        cliaNumber
        phone
        street
        streetTwo
        city
        state
        zipCode
        orderingProvider {
          firstName
          middleName
          lastName
          NPI
        }
      }
    }
  }
`;

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
    result,
    dateTested,
  } = testResult;

  return (
    <div
      className={classnames(
        "sr-test-result-report",
        correctionStatus === "REMOVED" && "sr-removed-result"
      )}
    >
      <header className="display-flex flex-align-end flex-justify margin-bottom-1">
        <h1>{t("testResult.result")}</h1>
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
            <li>
              <b>{t("testResult.testDate")}</b>
              <div>{formatDateWithTimeOption(dateTested, true)}</div>
            </li>
            <li>
              <b>{t("testResult.testResult")}</b>
              <div>
                <strong>
                  {result === "POSITIVE" && t("constants.testResults.POSITIVE")}
                  {result === "NEGATIVE" && t("constants.testResults.NEGATIVE")}
                  {result === "UNDETERMINED" &&
                    t("constants.testResults.UNDETERMINED")}
                </strong>
              </div>
            </li>
          </ul>
        </section>
        <section className="sr-result-section sr-result-next-steps">
          <h2>{t("testResult.moreInformation")}</h2>
          {result === "UNDETERMINED" && (
            <p>{t("testResult.notes.inconclusive.p0")}</p>
          )}
          {result !== "POSITIVE" && (
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
            </>
          )}
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
    query={testQuery}
    queryOptions={{ variables: { id: props.testResultId } }}
    Component={DetachedTestResultPrintModal}
    componentProps={{ ...props }}
  />
);

export default TestResultPrintModal;
