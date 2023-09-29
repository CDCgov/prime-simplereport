import React from "react";

import Modal from "../../../commonComponents/Modal";
import Button from "../../../commonComponents/Button/Button";
import { PendingOrganization } from "../../../../generated/graphql";

import { ConfirmDeleteOrgModalProps } from "./modal_utils";

const ConfirmDeleteOrgModal: React.FC<ConfirmDeleteOrgModalProps> = ({
  organization,
  onClose,
  handleDelete,
  isDeleting,
  isLoading,
  isOpen,
}) => {
  const adminName =
    organization?.adminFirstName + " " + organization?.adminLastName;

  const adminEmail = organization?.adminEmail
    ? organization?.adminEmail
    : "null";

  const handleDeleteOrgConfirm = (o: PendingOrganization | null) => {
    return o !== null ? handleDelete(o) : null;
  };

  const isButtonDisabled = isDeleting || isLoading;

  return (
    <Modal
      showModal={isOpen}
      title="Deletion confirmation for pending organizations"
      contentLabel="Deletion confirmation for pending organization"
      onClose={onClose}
    >
      <Modal.Header
        styleClassNames={"font-heading-lg margin-top-0 margin-bottom-205"}
      >
        Delete this organization?
      </Modal.Header>
      <div className="border-top border-base-lighter margin-x-neg-205 margin-top-205"></div>
      <div>
        <p className="text-bold margin-top-2">Organization name</p>
        <p className="margin-bottom-1">{organization?.name}</p>
        <p className="text-bold">Admin name</p>
        <p className="margin-bottom-1">{adminName}</p>
        <p className="text-bold">Admin email</p>
        <p className="margin-bottom-1">{adminEmail}</p>
      </div>
      <div className="border-top border-base-lighter margin-x-neg-205"></div>
      <Modal.Footer
        styleClassNames={"display-flex flex-justify-end margin-top-205"}
      >
        <Button
          className="margin-right-2"
          onClick={onClose}
          variant="unstyled"
          label="No, go back"
          disabled={isButtonDisabled}
        />
        <Button
          className="margin-right-0"
          onClick={() => handleDeleteOrgConfirm(organization)}
          id="confirm-deletion-button"
          label={isDeleting ? "Deleting..." : "Delete"}
          disabled={isButtonDisabled}
        />
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmDeleteOrgModal;
