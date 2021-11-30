import Modal from "react-modal";
import moment from "moment";

import Button from "../commonComponents/Button/Button";
import { formatFullName } from "../utils/user";
import "./TestResultCorrectionModal.scss";
import {
  useGetTestResultForResendingEmailsQuery,
  useResendTestResultsEmailMutation,
} from "../../generated/graphql";
import { showAlertNotification } from "../utils";
import "./EmailTestResultModal.scss";

const formatDate = (date: string | undefined) => {
  return moment(date)?.format("MMMM Do, YYYY");
};

interface Props {
  testResultId: string;
  closeModal: () => void;
}

export const EmailTestResultModal = ({ closeModal, testResultId }: Props) => {
  const [emailTestResult] = useResendTestResultsEmailMutation();

  const { data, loading } = useGetTestResultForResendingEmailsQuery({
    variables: { id: testResultId },
    fetchPolicy: "no-cache",
  });

  const patient = data?.testResult?.patient as Person;
  const dateTested = data?.testResult?.dateTested;
  const patientLinkId = data?.testResult?.patientLink?.internalId || "";

  return (
    <Modal
      isOpen={true}
      className="email-test-result-modal-content"
      overlayClassName="sr-test-correction-modal-overlay"
      contentLabel="Printable test result"
    >
      <div className="header">Email result?</div>
      {loading ? (
        <p>Loading</p>
      ) : (
        <>
          <div className="body">
            <div className="text">
              {formatFullName(patient)}'s test result from{" "}
              {formatDate(dateTested)} will be sent to the following emails:
            </div>
            {patient.emails?.map((email: string) => (
              <div key={email}>{email}</div>
            ))}
          </div>
          <div className="sr-test-correction-buttons">
            <Button variant="unstyled" label="Cancel" onClick={closeModal} />
            <Button
              label="Send result"
              onClick={() => {
                emailTestResult({
                  variables: { patientLinkId },
                }).then((response) => {
                  const success = response.data?.sendPatientLinkEmail;
                  showAlertNotification(
                    success ? "success" : "error",
                    success
                      ? "Emailed test results."
                      : "Failed to email test results."
                  );
                  window.scrollTo(0, 0);
                  closeModal();
                });
              }}
            />
          </div>
        </>
      )}
    </Modal>
  );
};

export default EmailTestResultModal;
