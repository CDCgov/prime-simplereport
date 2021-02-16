import React from "react";
import { gql } from "@apollo/client";
import Modal from "react-modal";
import Button from "../commonComponents/Button";
import { displayFullName } from "../utils";
import moment from "moment";
import "./TestResultPrintModal.scss";
import logo from "../../img/simplereport-logo-black.svg";
import { QueryWrapper } from "../commonComponents/QueryWrapper";

const formatDate = (date: string | undefined) =>
  moment(date)?.format("MM/DD/yyyy");

export const testQuery = gql`
  query getTestResultForPrint($id: String!) {
    testResult(id: $id) {
      dateTested
      result
      deviceType {
        name
      }
      patient {
        firstName
        middleName
        lastName
        birthDate
        gender
        telephone
        street
        streetTwo
        city
        county
        state
        zipCode
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
  const { patient, facility, deviceType } = data.testResult;

  return (
    <Modal
      isOpen={true}
      className="sr-test-results-modal-content"
      overlayClassName="sr-test-results-modal-overlay"
      contentLabel="Printable test result"
    >
      {buttonGroup}
      <div className="sr-test-result-report">
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
              <li>
                <b>Sex</b>
                <div>{patient.gender}</div>
              </li>
              <li>
                <b>Phone</b>
                <div>{patient.telephone}</div>
              </li>
              <li>
                <b>Address</b>
                <div>{patient.street}</div>
                {patient.streetTwo && (
                  <div className="hanging">{patient.streetTwo}</div>
                )}
                <div className="hanging">
                  {patient.city}, {patient.state} {patient.zipCode}
                </div>
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
                <div>SARS-CoV-2 Antigen</div>
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
                <div>{data.testResult.result}</div>
              </li>
            </ul>
          </section>
          <section className="sr-result-section sr-result-next-steps">
            <h2>Next Steps</h2>
            <p>
              Antigen tests can return inaccurate or false results and follow up
              testing may be needed. Continue social distancing and wearing a
              mask. Contact your healthcare provider to determine if additional
              testing is needed especially if you experience any of these
              COVID-19 symptoms.
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
