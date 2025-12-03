import React from "react";

import Button from "../Button/Button";
import Modal from "../Modal";
import { displayFullName } from "../../utils";
import { SettingsUser } from "../../Settings/Users/ManageUsersContainer";
import "../../Settings/Users/ManageUsers.scss";
import { User } from "../../../generated/graphql";

interface Props {
  onClose: () => void;
  onUndeleteUser: () => void;
  user: SettingsUser | User;
  isOpen: boolean;
}

const UndeleteUserModal: React.FC<Props> = ({
  onClose,
  onUndeleteUser,
  user,
  isOpen,
}) => {
  const modalTitle = `Undelete ${displayFullName(
    user.firstName,
    user.middleName,
    user.lastName,
    true
  )}`;

  return (
    <Modal
      onClose={onClose}
      title="Undelete user"
      contentLabel={modalTitle}
      showModal={isOpen}
    >
      <Modal.Header
        styleClassNames={"font-heading-lg margin-top-0 margin-bottom-205"}
      >
        {modalTitle}
      </Modal.Header>
      <div className="border-top border-base-lighter margin-x-neg-205"></div>
      <p className="margin-top-4">
        This user will regain access to the organization and facilities they
        were previously assigned to.
      </p>
      <div className="border-top border-base-lighter margin-x-neg-205"></div>
      <Modal.Footer
        styleClassNames={"display-flex flex-justify-end margin-top-205"}
      >
        <Button
          className="margin-right-205"
          variant="unstyled"
          label="No, go back"
          onClick={onClose}
        />
        <Button
          className="margin-right-0"
          label="Yes, undelete user"
          onClick={onUndeleteUser}
        />
      </Modal.Footer>
    </Modal>
  );
};

export default UndeleteUserModal;
