import { gql, useMutation } from "@apollo/client";
import Modal from "react-modal";

import Button from "../../../commonComponents/Button/Button";
import { showAlertNotification } from "../../../utils/srToast";
import { formatFullName } from "../../../utils/user";
import "./TestResultCorrectionModal.scss";
import {
  InjectedQueryWrapperProps,
  QueryWrapper,
} from "../../../commonComponents/QueryWrapper";
import { formatDateLong } from "../../../utils/date";

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

interface DetachedTestResultTextModalProps {
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
}: DetachedTestResultTextModalProps) => {
  const [sendSMS] = useMutation(SEND_SMS);
  const { patient, dateTested } = data.testResult;

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
    <>
      <h3>Text result?</h3>
      <p>
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
    </>
  );
};

interface TestResultTextModalProps extends DetachedTestResultTextModalProps {
  isOpen: boolean;
}
const TestResultTextModal = (
  props: Omit<TestResultTextModalProps, InjectedQueryWrapperProps>
) => (
  <Modal
    isOpen={props.isOpen}
    className="sr-test-correction-modal-content"
    overlayClassName="sr-test-correction-modal-overlay sr-legacy-application"
    contentLabel="Printable test result"
    onRequestClose={props.closeModal}
  >
    {props.testResultId && (
      <QueryWrapper<TestResultTextModalProps>
        query={testQuery}
        queryOptions={{
          variables: { id: props.testResultId },
          fetchPolicy: "no-cache",
        }}
        Component={DetachedTestResultTextModal}
        componentProps={{ ...props }}
      />
    )}
  </Modal>
);

export default TestResultTextModal;
