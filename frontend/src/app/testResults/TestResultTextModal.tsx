import { gql, useMutation } from "@apollo/client";
import Modal from "react-modal";

import Button from "../commonComponents/Button/Button";
import { showAlertNotification } from "../utils/srToast";
import { formatFullName } from "../utils/user";
import "./TestResultCorrectionModal.scss";
import {
  InjectedQueryWrapperProps,
  QueryWrapper,
} from "../commonComponents/QueryWrapper";
import { formatDateLong } from "../utils/date";

export const testQuery = gql`
  query getTestResultForText($id: ID!) {
    testResult(id: $id) {
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

export const SEND_SMS = gql`
  mutation sendSMS($id: ID!) {
    sendPatientLinkSmsByTestEventId(testEventId: $id)
  }
`;

interface Props {
  data: any; // testQuery result
  testResultId: string | undefined;
  closeModal: () => void;
}

const mobilePhoneNumbers = (phoneArray: PhoneNumber[]) => {
  let mobileNumbers: any = [];
  phoneArray.forEach((patientPhone) => {
    if (patientPhone.type === "MOBILE") {
      mobileNumbers.push(
        <tr key={patientPhone.number}>
          <td>{patientPhone.number}</td>
        </tr>
      );
    }
  });
  return mobileNumbers;
};

export const DetachedTestResultTextModal = ({
  data,
  closeModal,
  testResultId,
}: Props) => {
  const [sendSMS] = useMutation(SEND_SMS);
  const { patient } = data.testResult;
  const { dateTested } = data.testResult;
  const resendSMS = () => {
    sendSMS({
      variables: {
        id: testResultId,
      },
    })
      .then((response) => {
        const success = response.data?.sendPatientLinkSmsByTestEventId;
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
      onRequestClose={closeModal}
    >
      <h3>Text result?</h3>
      <p>
        {" "}
        {formatFullName(patient)} test result from {formatDateLong(dateTested)}{" "}
        will be sent to the following numbers:
      </p>
      <table>
        <tbody>{mobilePhoneNumbers(patient.phoneNumbers)}</tbody>
      </table>
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
    Component={DetachedTestResultTextModal}
    componentProps={{ ...props }}
  />
);

export default TestResultTextModal;
