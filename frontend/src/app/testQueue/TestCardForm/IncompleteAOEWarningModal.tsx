import {
  ButtonGroup,
  Modal,
  ModalFooter,
  ModalHeading,
  ModalRef,
  ModalToggleButton,
} from "@trussworks/react-uswds";
import React from "react";

interface IncompleteAOEWarningModalProps {
  submitModalRef: React.RefObject<ModalRef>;
  name: string;
  submitForm: (forceSubmit: boolean) => Promise<void>;
}

const IncompleteAOEWarningModal = ({
  submitModalRef,
  name,
  submitForm,
}: IncompleteAOEWarningModalProps) => {
  return (
    <Modal
      ref={submitModalRef}
      aria-labelledby="submit-modal-heading"
      id="submit-modal"
      aria-describedby="submit-modal-description"
    >
      <ModalHeading id="submit-modal-heading">
        The test questionnaire for {name} has not been completed.
      </ModalHeading>
      <p id="submit-modal-description">Do you want to submit results anyway?</p>
      <ModalFooter id={"submit-modal-footer"}>
        <ButtonGroup>
          <ModalToggleButton
            modalRef={submitModalRef}
            closer
            className={"margin-right-1"}
            onClick={() => submitForm(true)}
          >
            Submit anyway.
          </ModalToggleButton>
          <ModalToggleButton modalRef={submitModalRef} unstyled closer>
            No, go back.
          </ModalToggleButton>
        </ButtonGroup>
      </ModalFooter>
    </Modal>
  );
};

export default IncompleteAOEWarningModal;
