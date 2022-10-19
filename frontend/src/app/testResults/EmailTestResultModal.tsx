import Modal from "react-modal";

import Button from "../commonComponents/Button/Button";
import { formatFullName } from "../utils/user";
import "./TestResultCorrectionModal.scss";
import {
  useGetTestResultForResendingEmailsQuery,
  useResendTestResultsEmailMutation,
} from "../../generated/graphql";
import { showAlertNotification } from "../utils/srToast";
import "./EmailTestResultModal.scss";
import { formatDateLong } from "../utils/date";

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

  return (
    <Modal
      isOpen={true}
      className="email-test-result-modal-content"
      overlayClassName="sr-test-correction-modal-overlay"
      contentLabel="Printable test result"
      onRequestClose={closeModal}
    >
      <h1 className="font-sans-lg margin-top-0 margin-bottom-105 text-normal">
        Email result?
      </h1>
      {loading ? (
        <p>Loading</p>
      ) : (
        <>
          <div className="body">
            <div className="text">
              {formatFullName(patient)}'s test result from{" "}
              {formatDateLong(dateTested)} will be sent to the following emails:
            </div>
            <ul className="usa-list usa-list--unstyled">
              {patient.emails?.map((email: string) => (
                <li className="line-height-sans-2" key={email}>
                  {email}
                </li>
              ))}
            </ul>
          </div>
          <div className="sr-test-correction-buttons">
            <Button variant="unstyled" label="Cancel" onClick={closeModal} />
            <Button
              label="Send result"
              onClick={() => {
                emailTestResult({
                  variables: { testEventId: testResultId },
                }).then((response) => {
                  const success =
                    response.data?.sendPatientLinkEmailByTestEventId;
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
