import React from "react";
import { gql } from "@apollo/client";
import Modal from "react-modal";
import moment from "moment";
import classnames from "classnames";

import Button from "../commonComponents/Button/Button";
import { displayFullName } from "../utils";
import "./TestResultPrintModal.scss";
import logo from "../../img/simplereport-logo-black.svg";
import { QueryWrapper } from "../commonComponents/QueryWrapper";

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

interface Props {
  data: any; // testQuery result
  testResultId: string | undefined;
  closeModal: () => void;
}

export const DetachedTestResultPrintModal = ({
  testResultId,
  data,
  closeModal,
}: Props) => {
  const buttonGroup = (
    <div className="sr-result-print-buttons">
      <Button variant="unstyled" label="Close" onClick={closeModal} />
      <Button label="Print" onClick={() => window.print()} />
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
      {buttonGroup}
      <div
        className={classnames(
          "sr-test-result-report",
          correctionStatus === "REMOVED" && "sr-removed-result"
        )}
      >
        <header>
          <img alt="SimpleReport logo" src={logo} className="sr-print-logo" />
          <h1>SARS-CoV-2 Result</h1>
        </header>
        <main>
          <section className="sr-result-section sr-result-patient-details">
            <h2>Patient Details</h2>
            <ul className="sr-details-list">
              <li>
                <b>Name</b>
                <div>
                  {displayFullName(
                    patient.firstName,
                    patient.middleName,
                    patient.lastName
                  )}
                </div>
              </li>
              <li>
                <b>Date of Birth</b>
                <div>{formatDate(patient.birthDate)}</div>
              </li>
            </ul>
          </section>
          <section className="sr-result-section sr-result-facility-details">
            <h2>Facility Details</h2>
            <ul className="sr-details-list">
              <li>
                <b>Facility Name</b>
                <div>{facility.name}</div>
              </li>
              <li>
                <b>Facility Phone</b>
                <div>{facility.phone}</div>
              </li>
              <li>
                <b>Facility Address</b>
                <div>{facility.street}</div>
                {facility.streetTwo && <div>{facility.streetTwo}</div>}
                <div>
                  {facility.city}, {facility.state} {facility.zipCode}
                </div>
              </li>
              <li>
                <b>CLIA Number</b>
                <div>{facility.cliaNumber}</div>
              </li>
              <li>
                <b>Ordering Provider</b>
                <div>
                  {displayFullName(
                    facility.orderingProvider.firstName,
                    facility.orderingProvider.middleName,
                    facility.orderingProvider.lastName
                  )}
                </div>
              </li>
              <li>
                <b>NPI</b>
                <div>{facility.orderingProvider.NPI}</div>
              </li>
            </ul>
          </section>
          <section className="sr-result-section sr-result-test-details">
            <h2>Test Details</h2>
            <ul className="sr-details-list">
              <li>
                <b>Specimen ID</b>
                <div>{testResultId}</div>
              </li>
              <li>
                <b>Test Name</b>
                <div>{testPerformed.name}</div>
              </li>
              <li>
                <b>Test Device</b>
                <div>{deviceType.name}</div>
              </li>
              <li>
                <b>Test Date</b>
                <div>{formatDate(data.testResult.dateTested)}</div>
              </li>
              <li>
                <b>Test Result</b>
                <div>
                  <strong>{data.testResult.result}</strong>
                </div>
              </li>
            </ul>
          </section>
          <section className="sr-result-section sr-result-next-steps">
            <h2>Notes</h2>
            {data.testResult.result !== "POSITIVE" && (
              <>
                <p>
                  Antigen tests can return inaccurate or false results and
                  follow up testing may be needed. Continue social distancing
                  and wearing a mask. Contact your healthcare provider to
                  determine if additional testing is needed especially if you
                  experience any of these COVID-19 symptoms.
                </p>
                <ul className="sr-multi-column">
                  <li>Fever or chills</li>
                  <li>Cough</li>
                  <li>Shortness of breath or difficulty breathing</li>
                  <li>Fatigue</li>
                  <li>Muscle or body aches</li>
                  <li>Headache</li>
                  <li>New loss of taste or smell</li>
                  <li>Sore throat</li>
                  <li>Congestion or runny nose</li>
                  <li>Nausea or vomiting</li>
                  <li>Diarrhea</li>
                </ul>
              </>
            )}
            {data.testResult.result === "POSITIVE" && (
              <>
                <p>
                  Most people who get COVID-19 will be able to recover at home.
                  CDC has directions for people who are recovering at home and
                  their caregivers, including:
                </p>
                <ul>
                  <li>
                    Stay home when you are sick, except to get medical care.
                  </li>
                  <li>
                    Use a separate room and bathroom for sick household members
                    (if possible). Clean the sick room and bathroom, as needed,
                    to avoid unnecessary contact with the sick person.
                  </li>
                  <li>
                    Wash your hands often with soap and water for at least 20
                    seconds, especially after blowing your nose, coughing, or
                    sneezing; going to the bathroom; and before eating or
                    preparing food.
                  </li>
                  <li>
                    If soap and water are not available, use an alcohol-based
                    hand sanitizer with at least 60% alcohol.
                  </li>
                  <li>
                    Provide your sick household member with clean disposable
                    facemasks to wear at home. Everyone else should wear masks
                    at home.
                  </li>
                </ul>
                <p>
                  More information is available at
                  https://www.cdc.gov/coronavirus/2019-ncov/if-you-are-sick/
                </p>
                <p>
                  Watch for symptoms and learn when to seek emergency medical
                  attention here:
                  https://www.cdc.gov/coronavirus/2019-ncov/symptoms-testing/symptoms.html
                </p>
                <p>
                  If someone is showing any of these signs, seek emergency
                  medical care immediately:
                </p>
                <ul className="sr-multi-column" style={{ height: "5ex" }}>
                  <li>Trouble breathing</li>
                  <li>Persistent chest pain/pressure</li>
                  <li>New confusion</li>
                  <li>Inability to wake or stay awake</li>
                  <li>Bluish lips or face</li>
                </ul>
                <p>
                  Call 911 or call ahead to your local emergency facility:
                  Notify the operator that you are seeking care for someone who
                  has or may have COVID-19.
                </p>
              </>
            )}
          </section>
        </main>
        <footer>
          <p>Test result printed {new Date().toLocaleString()}</p>
        </footer>
      </div>
      {buttonGroup}
    </Modal>
  );
};

const TestResultPrintModal = (props: Omit<Props, "data">) => (
  <QueryWrapper<Props>
    query={testQuery}
    queryOptions={{ variables: { id: props.testResultId } }}
    Component={DetachedTestResultPrintModal}
    componentProps={{ ...props }}
  />
);

export default TestResultPrintModal;
