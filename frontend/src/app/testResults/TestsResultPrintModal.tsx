import React from "react";
import Modal from "react-modal";
import Button from "../commonComponents/Button";
import { displayFullName } from "../utils";
import moment from "moment";
import "./TestResultPrintModal.scss";
import logo from "../../img/simplereport-logo-black.svg";

const formatDate = (date: string | undefined) =>
  moment(date)?.format("MM/DD/yyyy");

interface Props {
  item: any;
  closeModal: () => void;
}

const TestResultPrintModal = ({ item, closeModal }: Props) => {
  const printDocument = () => {
    window.print();
  };
  const buttonGroup = (
    <div className="sr-result-print-buttons">
      <Button variant="unstyled" label="Close" onClick={closeModal} />
      <Button label="Print" onClick={printDocument} />
    </div>
  );
  const patient = item.patient;

  return (
    <Modal
      isOpen={true}
      style={{
        content: {
          border: "none",
          inset: "3em auto auto auto",
          overflow: "auto",
          maxHeight: "90vh",
          width: "80%",
          minWidth: "40em",
          maxWidth: "120em",
          transform: "translate(10%, 0)",
        },
        overlay: {
          background: "#ddd",
        },
      }}
      overlayClassName="prime-modal-overlay"
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
                <span>
                  {displayFullName(
                    patient.firstName,
                    patient.middleName,
                    patient.lastName
                  )}
                </span>
              </li>
              <li>
                <b>Date of Birth</b>
                <span>{formatDate(patient.birthDate)}</span>
              </li>
              <li>
                <b>Sex</b>
                <span>{patient.gender}</span>
              </li>
              <li>
                <b>Phone</b>
                <span>{patient.telephone}</span>
              </li>
              <li>
                <b>Address</b>
                <span>{patient.street}</span>
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
                <span>xxxx</span>
              </li>
              <li>
                <b>Facility Phone</b>
                <span>xxxx</span>
              </li>
              <li>
                <b>Facility Address</b>
                <span>xxxx</span>
              </li>
              <li>
                <b>CLIA Number</b>
                <span>xxxx</span>
              </li>
              <li>
                <b>Ordering Provider</b>
                <span>xxxx</span>
              </li>
              <li>
                <b>NPI</b>
                <span>xxxx</span>
              </li>
            </ul>
          </section>
          <section className="sr-result-section sr-result-test-details">
            <h2>Test Details</h2>
            <ul className="sr-details-list">
              <li>
                <b>Specimen ID</b>
                <span>xxxx</span>
              </li>
              <li>
                <b>Test Name</b>
                <span>xxxx</span>
              </li>
              <li>
                <b>Test Device</b>
                <span>{item.deviceType.name}</span>
              </li>
              <li>
                <b>Collection Date</b>
                <span>xxxx</span>
              </li>
              <li>
                <b>Test Date</b>
                <span>{formatDate(item.dateTested)}</span>
              </li>
              <li>
                <b>Test Result</b>
                <span>{item.result}</span>
              </li>
            </ul>
          </section>
          <section className="sr-result-section sr-result-next-steps">
            <h2>Next Steps</h2>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
              reprehenderit in voluptate velit esse cillum dolore eu fugiat
              nulla pariatur. Excepteur sint occaecat cupidatat non proident,
              sunt in culpa qui officia deserunt mollit anim id est laborum
            </p>
          </section>
        </main>
        <footer>
          <em>Test result printed {new Date().toLocaleString()}</em>
        </footer>
      </div>
      {buttonGroup}
    </Modal>
  );
};

export default TestResultPrintModal;
