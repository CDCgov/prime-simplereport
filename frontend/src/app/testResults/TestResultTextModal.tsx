import React, { useState } from "react";
import { gql, useMutation } from "@apollo/client";
import Modal from "react-modal";

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
      <h3>Text Result?</h3>
      <p>
        {" "}
        {displayFullName(
          patient.firstName,
          patient.middleName,
          patient.lastName
        )}{" "}
        from July 21st will be sent to the following numbers:
      </p>
      as an error?
      <p>If so, please enter a reason.</p>
      <div className="sr-test-correction-buttons">
        <Button variant="unstyled" label="Cancel" onClick={closeModal} />
        <Button
          label="Send Result"
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
