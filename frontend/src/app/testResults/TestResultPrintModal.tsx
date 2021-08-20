import React from "react";
import { gql } from "@apollo/client";
import Modal from "react-modal";
import moment from "moment";
import classnames from "classnames";
import { Trans, useTranslation } from "react-i18next";

import Button from "../commonComponents/Button/Button";
import { displayFullName } from "../utils";
import "./TestResultPrintModal.scss";
import logo from "../../img/simplereport-logo-black.svg";
import { QueryWrapper } from "../commonComponents/QueryWrapper";
import LanguageToggler from "../../patientApp/LanguageToggler";

const formatDate = (date: string | undefined) =>
  moment(date)?.format("MM/DD/yyyy");

export const testQuery = gql`
  query getTestResultForPrint($id: ID!) {
    testResult(id: $id) {
      dateTested
      result
      correctionStatus
      deviceType {
        name
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
      testPerformed {
        name
        loincCode
      }
    }
  }
`;

export interface TestResultPrintModalProps {
  data: any; // testQuery result
  testResultId: string | undefined;
  closeModal: () => void;
}

export const DetachedTestResultPrintModal = ({
  testResultId,
  data,
  closeModal,
}: TestResultPrintModalProps) => {
  const { t } = useTranslation();

  const buttonGroup = (
    <div className="sr-result-print-buttons">
      <Button
        variant="unstyled"
        label={t("testResult.close")}
        onClick={closeModal}
      />
      <Button label={t("testResult.print")} onClick={() => window.print()} />
    </div>
  );
  const {
    patient,
    facility,
    deviceType,
    testPerformed,
    correctionStatus,
  } = data.testResult;

  return (
    <Modal
      isOpen={true}
      className="sr-test-results-modal-content"
      overlayClassName="sr-test-results-modal-overlay"
      contentLabel="Printable test result"
    >
      <div
        className="display-flex flex-align-center maxw-tablet grid-container patient-header"
        style={{ paddingLeft: "0rem", paddingRight: "0rem" }}
      >
        <LanguageToggler />
        {buttonGroup}
      </div>
      <div
        className={classnames(
          "sr-test-result-report",
          correctionStatus === "REMOVED" && "sr-removed-result"
        )}
      >
        <header>
          <img alt="SimpleReport logo" src={logo} className="sr-print-logo" />
          <h1>{t("testResult.result")}</h1>
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
                    patient.lastName
                  )}
                </div>
              </li>
              <li>
                <b>{t("testResult.dob.dateOfBirth")}</b>
                <div>{formatDate(patient.birthDate)}</div>
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
                    facility.orderingProvider.lastName
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
                <b>{t("testResult.specimen")}</b>
                <div>{testResultId}</div>
              </li>
              <li>
                <b>{t("testResult.testName")}</b>
                <div>{testPerformed.name}</div>
              </li>
              <li>
                <b>{t("testResult.testDevice")}</b>
                <div>{deviceType.name}</div>
              </li>
              <li>
                <b>{t("testResult.testDate")}</b>
                <div>{formatDate(data.testResult.dateTested)}</div>
              </li>
              <li>
                <b>{t("testResult.testResult")}</b>
                <div>
                  <strong>
                    {data.testResult.result === "POSITIVE" &&
                      t("constants.testResults.POSITIVE")}
                    {data.testResult.result === "NEGATIVE" &&
                      t("constants.testResults.NEGATIVE")}
                    {data.testResult.result === "UNDETERMINED" &&
                      t("constants.testResults.UNDETERMINED")}
                  </strong>
                </div>
              </li>
            </ul>
          </section>
          <section className="sr-result-section sr-result-next-steps">
            <h2>{t("testResult.note")}</h2>
            {data.testResult.result !== "POSITIVE" && (
              <>
                <p>{t("testResult.notes.meaning")}</p>
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
            {data.testResult.result === "POSITIVE" && (
              <>
                <ul>
                  <li>{t("testResult.notes.positive.guidelines.li0")}</li>
                  <li>{t("testResult.notes.positive.guidelines.li1")}</li>
                  <li>{t("testResult.notes.positive.guidelines.li2")}</li>
                  <li>{t("testResult.notes.positive.guidelines.li3")}</li>
                  <li>{t("testResult.notes.positive.guidelines.li4")}</li>
                  <li>{t("testResult.notes.positive.guidelines.li5")}</li>
                </ul>
                <p>{t("testResult.notes.positive.moreInformation")}</p>
                <Trans
                  t={t}
                  parent="p"
                  i18nKey="testResult.notes.positive.p2"
                  components={[
                    t("testResult.notes.positive.whenToSeek") +
                      ": " +
                      t("testResult.notes.positive.symptomsLink"),
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
                  i18nKey="testResult.notes.positive.difficultNewsLink"
                  components={[
                    null,
                    `: ${t("testResult.notes.positive.difficultNewsURL")}`,
                  ]}
                />
              </>
            )}
          </section>
        </main>
        <footer>
          <p>
            {t("testResult.printed")} {new Date().toLocaleString()}
          </p>
        </footer>
      </div>
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
