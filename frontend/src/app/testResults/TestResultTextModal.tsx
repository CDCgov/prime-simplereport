import { gql, useMutation } from "@apollo/client";
import Modal from "react-modal";
import moment from "moment";

import Button from "../commonComponents/Button/Button";
import { showAlertNotification } from "../utils";
import { formatFullName } from "../utils/user";
import "./TestResultCorrectionModal.scss";
import {
  InjectedQueryWrapperProps,
  QueryWrapper,
} from "../commonComponents/QueryWrapper";

export const testQuery = gql`
  query getTestResultForText($id: ID!) {
    testResult(id: $id) {
      patientLink {
        internalId
      }
      dateTested
      patient {
        firstName
        middleName
        lastName
        birthDate
        phoneNumbers {
          type
          number
        }
      }
    }
  }
`;
interface patientPhoneDetails {
  type: string;
  number: number;
}
const formatDate = (date: string | undefined, withTime?: boolean) => {
  const dateFormat = "MMMM Do, YYYY";
  const format = withTime ? `${dateFormat}` : dateFormat;
  return moment(date)?.format(format);
};

const SEND_SMS = gql`
  mutation sendSMS($id: ID!) {
    sendPatientLinkSms(internalId: $id)
  }
`;

interface Props {
  data: any; // testQuery result
  testResultId: string | undefined;
  closeModal: () => void;
}

const mobilePhoneNumbers = (phoneArray: patientPhoneDetails[]) => {
  let mobileNumbers: any = [];
  phoneArray.forEach((patientPhone) => {
    if (patientPhone.type === "MOBILE") {
      mobileNumbers.push(<tr>{patientPhone.number}</tr>);
    }
  });
  return mobileNumbers;
};

export const DetachedTestResultCorrectionModal = ({
  data,
  closeModal,
}: Props) => {
  const [sendSMS] = useMutation(SEND_SMS);
  const { patient } = data.testResult;
  const patientLink = data.testResult.patientLink.internalId;
  const { dateTested } = data.testResult;
  const resendSMS = () => {
    sendSMS({
      variables: {
        id: patientLink,
      },
    })
      .then((response) => {
        const success = response.data?.sendPatientLinkSms;
        showAlertNotification(
          success ? "success" : "error",
          success ? "Texted test results." : "Failed to text test results."
        );
      })
      .finally(() => {
        closeModal();
      });
  };

  return (
    <Modal
      isOpen={true}
      className="sr-test-correction-modal-content"
      overlayClassName="sr-test-correction-modal-overlay"
      contentLabel="Printable test result"
    >
      <h3>Text result?</h3>
      <p>
        {" "}
        {formatFullName(patient)} test result from {formatDate(dateTested)} will
        be sent to the following numbers:
        <table>{mobilePhoneNumbers(patient.phoneNumbers)}</table>
      </p>
      <div className="sr-test-correction-buttons">
        <Button variant="unstyled" label="Cancel" onClick={closeModal} />
        <Button label="Send result" onClick={resendSMS} />
      </div>
    </Modal>
  );
};

const TestResultTextModal = (props: Omit<Props, InjectedQueryWrapperProps>) => (
  <QueryWrapper<Props>
    query={testQuery}
    queryOptions={{ variables: { id: props.testResultId } }}
    Component={DetachedTestResultCorrectionModal}
    componentProps={{ ...props }}
  />
);

export default TestResultTextModal;
