import React from "react";

import Button from "../../commonComponents/Button/Button";
import Modal from "../../commonComponents/Modal";

export type IncompleteAOEWarningModalProps = {
  name: string;
  submitForm: (forceSubmit: boolean) => Promise<void>;
  showModal: boolean;
  onClose: () => void;
};

export const IncompleteAOEWarningModal: React.FC<
  IncompleteAOEWarningModalProps
> = ({ name, submitForm, showModal, onClose }) => {
  return (
    <Modal
      onClose={onClose}
      showModal={showModal}
      showClose={true}
      variant="mobile-lg"
      contentLabel={"Incomplete ask on entry"}
    >
      <Modal.Header styleClassNames={"font-sans-lg line-height-sans-3"}>
        The test questionnaire for {name} has not been completed.
      </Modal.Header>
      <p>Do you want to submit results anyway?</p>
      <Modal.Footer styleClassNames={"margin-top-2 float-left"}>
        <Button onClick={() => submitForm(true)} className={"margin-0"}>
          Submit anyway.
        </Button>
        <Button
          onClick={onClose}
          variant={"unstyled"}
          className={"font-sans-sm"}
        >
          No, go back
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
