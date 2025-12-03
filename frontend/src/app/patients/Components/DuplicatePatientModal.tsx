import React from "react";
import { useTranslation } from "react-i18next";

import Button from "../../commonComponents/Button/Button";
import Modal from "../../commonComponents/Modal";

const noop = () => {
  /**
   * The `onClose` callback is technically optional in this component but not
   * in the child `Modal` component. Pass a no-op callback to the inner
   * component to satisfy the prop type requirement
   */
};

export type DuplicateModalProps = {
  showModal: boolean;
  onDuplicate: () => void;
  entityName: string | undefined;
  onClose?: () => void;
};

export type IdentifyingData = {
  firstName: string;
  lastName: string;
  birthDate: moment.Moment;
  facilityId?: string | null;
};

export const DuplicatePatientModal: React.FC<DuplicateModalProps> = ({
  showModal,
  onDuplicate,
  entityName,
  onClose,
}) => {
  const { t } = useTranslation();

  return (
    <Modal
      onClose={onClose || noop}
      showModal={showModal}
      showClose={false}
      variant="warning"
      contentLabel={"Duplicate patient"}
    >
      <Modal.Header styleClassNames={"margin-0 font-sans-lg"}>
        {onClose
          ? `This patient is already registered at ${entityName}`
          : `${t("selfRegistration.duplicate.heading")} ${entityName}`}
      </Modal.Header>
      <p>
        {onClose
          ? "Our records show someone has registered with the same name, date of birth, and ZIP code. You don't need to register this patient again."
          : t("selfRegistration.duplicate.message")}
      </p>
      <Modal.Footer>
        <Button onClick={onDuplicate}>
          {t("selfRegistration.duplicate.exit")}
        </Button>
        {/* This button does not appear in the self-registration workflow - no translation required */}
        {onClose && <Button onClick={onClose}>Register anyway</Button>}
      </Modal.Footer>
    </Modal>
  );
};
