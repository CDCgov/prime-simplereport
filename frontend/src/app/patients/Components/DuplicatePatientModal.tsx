import React from "react";

import Button from "../../commonComponents/Button/Button";
import Modal from "../../commonComponents/Modal";

export type DuplicateModalProps = {
  showModal: boolean;
  onDuplicate: () => void;
  entityName: string | undefined;
  onClose?: () => void;
};

export type IdentifyingData = {
  firstName: string;
  lastName: string;
  zipCode: string;
  birthDate: moment.Moment;
  facilityId?: string | null;
};

export const DuplicatePatientModal: React.FC<DuplicateModalProps> = ({
  showModal,
  onDuplicate,
  entityName,
  onClose,
}) => {
  return (
    <Modal
      onClose={() => {}}
      showModal={showModal}
      showClose={false}
      variant="warning"
    >
      <Modal.Header>You already have a profile at {entityName}.</Modal.Header>
      <p>
        Our records show someone has registered with the same name, date of
        birth, and ZIP code. Please check in with your testing site staff. You
        do not need to register again.
      </p>
      <Modal.Footer>
        <Button onClick={onDuplicate}>Exit sign up</Button>
        {onClose && <Button onClick={onClose}>Register anyway</Button>}
      </Modal.Footer>
    </Modal>
  );
};
