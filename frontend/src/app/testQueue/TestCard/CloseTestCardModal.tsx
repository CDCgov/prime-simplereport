import {
  ButtonGroup,
  Modal,
  ModalFooter,
  ModalHeading,
  ModalRef,
  ModalToggleButton,
} from "@trussworks/react-uswds";
import React from "react";

interface CloseTestCardModalProps {
  closeModalRef: React.RefObject<ModalRef>;
  name: string;
  removeTestFromQueue: () => Promise<void>;
}

const CloseTestCardModal = ({
  closeModalRef,
  name,
  removeTestFromQueue,
}: CloseTestCardModalProps) => {
  return (
    <Modal
      ref={closeModalRef}
      aria-describedby="close-modal-description"
      aria-labelledby="close-modal-heading"
      id="close-modal"
    >
      <ModalHeading id="close-modal-heading">
        Are you sure you want to stop {name}'s test?
      </ModalHeading>
      <p id="close-modal-description">
        Doing so will remove this person from the list. You can use the search
        bar to start their test again later.
      </p>
      <ModalFooter id={"close-modal-footer"}>
        <ButtonGroup>
          <ModalToggleButton
            modalRef={closeModalRef}
            closer
            className={"margin-right-1"}
            onClick={removeTestFromQueue}
          >
            Yes, I'm sure
          </ModalToggleButton>
          <ModalToggleButton modalRef={closeModalRef} unstyled closer>
            No, go back
          </ModalToggleButton>
        </ButtonGroup>
      </ModalFooter>
    </Modal>
  );
};

export default CloseTestCardModal;
