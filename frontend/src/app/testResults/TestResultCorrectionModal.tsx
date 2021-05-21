import React, { useState } from "react";
import { gql, useMutation } from "@apollo/client";
import Modal from "react-modal";
import { toast } from "react-toastify";

import Button from "../commonComponents/Button/Button";
import { displayFullName, showNotification } from "../utils";
import "./TestResultCorrectionModal.scss";
import {
  InjectedQueryWrapperProps,
  QueryWrapper,
} from "../commonComponents/QueryWrapper";
import Alert from "../commonComponents/Alert";

export const testQuery = gql`
  query getTestResultForCorrection($id: ID!) {
    testResult(id: $id) {
      dateTested
      result
      correctionStatus
      deviceType {
        name
      }
      patient {
        firstName
        middleName
        lastName
        birthDate
      }
    }
  }
`;

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

export const DetachedTestResultCorrectionModal = ({
  testResultId,
  data,
  closeModal,
}: Props) => {
  const [markTestAsError] = useMutation(MARK_TEST_AS_ERROR);
  const { patient } = data.testResult;
  const [reason, setReason] = useState("");
  const markAsError = () => {
    markTestAsError({
      variables: {
        id: testResultId,
        reason,
      },
    })
      .then(() => {
        const alert = (
          <Alert type="success" title="Result marked as error" body="" />
        );
        showNotification(toast, alert);
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
      <p>
        Are you sure you want to mark this test result for
        <b>
          {" "}
          {displayFullName(
            patient.firstName,
            patient.middleName,
            patient.lastName
          )}{" "}
        </b>
        as an error?
      </p>
      <p>If so, please enter a reason.</p>
      <p>
        <textarea
          className="sr-test-correction-reason"
          name="correctionReason"
          onChange={(e) => setReason(e.target.value)}
        ></textarea>
      </p>
      <div className="sr-test-correction-buttons">
        <Button variant="unstyled" label="No, go back" onClick={closeModal} />
        <Button
          label="Yes, I'm sure"
          disabled={reason.trim().length < 4}
          onClick={markAsError}
        />
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
