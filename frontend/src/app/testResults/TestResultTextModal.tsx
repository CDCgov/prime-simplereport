import { gql, useMutation } from "@apollo/client";
import Modal from "react-modal";
import moment from "moment";


import Button from "../commonComponents/Button/Button";
import { showNotification } from "../utils";
import { formatFullName } from "../utils/user";
import "./TestResultCorrectionModal.scss";
import {
  InjectedQueryWrapperProps,
  QueryWrapper,
} from "../commonComponents/QueryWrapper";
import Alert from "../commonComponents/Alert";


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
interface patientPhoneDetails {
    type: string
    number: number

}
const formatDate = (date: string | undefined, withTime?: boolean) => {
  const dateFormat = "MMMM Do, YYYY";
  const format = withTime ? `${dateFormat}` : dateFormat;
  return moment(date)?.format(format);
};



const MARK_TEST_AS_ERROR = gql`
  mutation MarkTestAsError($id: ID!, $reason: String!) {
    correctTestMarkAsError(id: $id, reason: $reason) {
      internalId
    }
  }
`;

interface Props {
  data: any; // testQuery result
  testResultId: string | undefined;
  closeModal: () => void;
}

const mobilePhoneNumbers = (phoneArray: patientPhoneDetails[]) => {
    let mobileNumbers: any = []
    phoneArray.forEach(patientPhone => {
        if (patientPhone.type === "MOBILE") {
            mobileNumbers.push(<tr>{patientPhone.number}</tr>);
        }
    });
 return mobileNumbers;
};



export const DetachedTestResultCorrectionModal = ({
  testResultId,
  data,
  closeModal,
}: Props) => {
  const [markTestAsError] = useMutation(MARK_TEST_AS_ERROR);
  const { patient } = data.testResult;
  console.log(patient,"HERE IT IS")
  const { dateTested } = data.testResult
  const markAsError = () => {
    markTestAsError({
      variables: {
        id: testResultId,
      },
    })
      .then(() => {
        const alert = (
          <Alert type="success" title="Result marked as error" body="" />
        );
        showNotification(alert);
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
      <h3>Text Results?</h3>
      <p>
        {" "}
        {formatFullName(patient)} testresults from {formatDate(dateTested)} will
        be sent to the following numbers:
        <table>{mobilePhoneNumbers(patient.phoneNumbers)}</table>
      </p>
      <div className="sr-test-correction-buttons">
        <Button variant="unstyled" label="Cancel" onClick={closeModal} />
        <Button label="Send results" onClick={markAsError} />
      </div>
    </Modal>
  );
};

const TestResultCorrectionModal = (
  props: Omit<Props, InjectedQueryWrapperProps>
) => (
  <QueryWrapper<Props>
    query={testQuery}
    queryOptions={{ variables: { id: props.testResultId } }}
    Component={DetachedTestResultCorrectionModal}
    componentProps={{ ...props }}
  />
);

export default TestResultCorrectionModal;


