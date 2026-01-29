import React from "react";
import Modal from "react-modal";

import Button from "../../../commonComponents/Button/Button";
import { formatFullName } from "../../../utils/user";
import {
  GetTestResultForResendingEmailsDocument,
  useResendTestResultsEmailMutation,
} from "../../../../generated/graphql";
import { showAlertNotification } from "../../../utils/srToast";
import { formatDateLong } from "../../../utils/date";
import { QueryWrapper } from "../../../commonComponents/QueryWrapper";

import "./EmailTestResultModal.scss";

interface DetachedEmailTestResultModalProps {
  data: any;
  testResultId: string;
  closeModal: () => void;
}

const DetachedEmailTestResultModal = ({
  data,
  closeModal,
  testResultId,
}: DetachedEmailTestResultModalProps) => {
  const [emailTestResult] = useResendTestResultsEmailMutation();

  const patient = data?.testResult?.patient as Person;
  const dateTested = data?.testResult?.dateTested;

  return (
    <>
      <h1 className="font-sans-lg margin-top-0 margin-bottom-105 text-normal">
        Email result?
      </h1>
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
              const success = response.data?.sendPatientLinkEmailByTestEventId;
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
  );
};
export type EmailTestResultModalProps = Omit<
  DetachedEmailTestResultModalProps,
  "data"
> & {
  isOpen: boolean;
};

const EmailTestResultModal = (props: EmailTestResultModalProps) => (
  <Modal
    isOpen={props.isOpen}
    className="email-test-result-modal-content"
    overlayClassName="sr-test-correction-modal-overlay sr-legacy-application"
    contentLabel="Printable test result"
    onRequestClose={props.closeModal}
  >
    {props.testResultId && (
      <QueryWrapper<DetachedEmailTestResultModalProps>
        query={GetTestResultForResendingEmailsDocument}
        queryOptions={{
          variables: { id: props.testResultId },
          fetchPolicy: "no-cache",
        }}
        Component={DetachedEmailTestResultModal}
        componentProps={{ ...props }}
      />
    )}
  </Modal>
);

export default EmailTestResultModal;
