import React from "react";

import Button from "../../commonComponents/Button/Button";
import Modal from "../../commonComponents/Modal";

export type CloseTestCardModalProps = {
  name: string;
  removeTestFromQueue: () => Promise<void>;
  showModal: boolean;
  onClose: () => void;
};

export const CloseTestCardModal: React.FC<CloseTestCardModalProps> = ({
  name,
  removeTestFromQueue,
  showModal,
  onClose,
}) => {
  return (
    <Modal
      onClose={onClose}
      showModal={showModal}
      showClose={true}
      contentLabel={"Close test card"}
      variant="mobile-lg"
    >
      <Modal.Header styleClassNames={"line-height-sans-3"}>
        Are you sure you want to stop {name}'s test?
      </Modal.Header>
      <p>
        Doing so will remove this person from the list. You can use the search
        bar to start their test again later.
      </p>
      <Modal.Footer styleClassNames={"margin-top-2 float-left"}>
        <Button onClick={removeTestFromQueue} className={"margin-0"}>
          Yes, I'm sure
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
