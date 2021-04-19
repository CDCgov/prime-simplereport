import { gql } from "@apollo/client";
import Modal from "react-modal";
import moment from "moment";
import classnames from "classnames";

import Button from "../commonComponents/Button";
import "./TestResultPrintModal.scss";
import { QueryWrapper } from "../commonComponents/QueryWrapper";
import { TestResult } from "../testQueue/QueueItem";
import { formatFullName } from "../utils/user";

type Result = {
  dateTested: string;
  result: TestResult;
  correctionStatus: TestCorrectionStatus;
  noSymptoms: boolean;
  symptoms: string;
  symptomOnset: string;
  pregnancy: string;
  deviceType: {
    name: string;
  };
  patient: {
    firstName: string;
    middleName: string;
    lastName: string;
    birthDate: string;
  };
  createdBy: {
    name: {
      firstName: string;
      middleName: string;
      lastName: string;
    };
  };
};

const formatDate = (date: string | undefined) =>
  moment(date)?.format("MM/DD/yyyy");

export const testQuery = gql`
  query getTestResultDetails($id: ID!) {
    testResult(id: $id) {
      dateTested
      result
      correctionStatus
      noSymptoms
      symptoms
      symptomOnset
      pregnancy
      deviceType {
        name
      }
      patient {
        firstName
        middleName
        lastName
        birthDate
      }
      createdBy {
        name {
          firstName
          middleName
          lastName
        }
      }
    }
  }
`;

interface Props {
  data: { testResult: Nullable<Result> };
  testResultId: string;
  closeModal: () => void;
}

export const DetachedTestResultDetailsModal = ({
  testResultId,
  data,
  closeModal,
}: Props) => {
  const {
    dateTested,
    result,
    correctionStatus,
    noSymptoms,
    symptoms,
    symptomOnset,
    pregnancy,
    deviceType,
    patient,
    createdBy,
  } = data.testResult;

  return (
    <Modal
      isOpen={true}
      style={{
        content: {
          maxHeight: "90vh",
          width: "40em",
          position: "initial",
        },
      }}
      overlayClassName="prime-modal-overlay display-flex flex-align-center flex-justify-center"
      contentLabel="Unsaved changes to current user"
      ariaHideApp={process.env.NODE_ENV !== "test"}
    >
      <h1>Test Details</h1>
      <h2>Patient</h2>
      <h2>Test details</h2>
      <ul>
        <li>SARS-CoV-2 Result - {result}</li>
        <li>Test date - {dateTested ? formatDate(dateTested) : "Missing"}</li>
        <li>Device - {deviceType ? deviceType.name : "Missing"}</li>
        <li>Symptoms - {symptoms}</li>
        <li>
          Symptom Onset - {symptomOnset ? formatDate(symptomOnset) : "Missing"}
        </li>
        <li>Pregnant? - {pregnancy}</li>
        <li>
          Submitted by -{" "}
          {createdBy?.name ? formatFullName(createdBy.name as User) : "Missing"}
        </li>
      </ul>
    </Modal>
  );
};

const TestResultDetailsModal = (props: Omit<Props, "data">) => (
  <QueryWrapper<Props>
    query={testQuery}
    queryOptions={{ variables: { id: props.testResultId } }}
    Component={DetachedTestResultDetailsModal}
    componentProps={{ ...props }}
  />
);

export default TestResultDetailsModal;
