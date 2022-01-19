import React from "react";
import Modal from "react-modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Input from "../../../commonComponents/Input";
import Button from "../../../commonComponents/Button/Button";
import { PendingOrganizationFormValues } from "../utils";

import { DeletionModalProps } from "./modal_utils";

const ConfirmDeleteOrgModal: React.FC<DeletionModalProps> = ({
  organization,
  handleClose,
  handleDelete,
  isUpdating,
}) => {
  const commonInputProps = {
    disabled: true,
    formObject: organization as PendingOrganizationFormValues,
    onChange: null,
    required: false,
    validate: null,
    errors: null,
    getValidationStatus: null,
  };
  return (
    <Modal isOpen={true}>
      <div className="border-0 card-container">
        <div className="display-flex flex-justify">
          <h1 className="font-heading-lg margin-top-05 margin-bottom-0">
            Confirm deletion of the following org
          </h1>
          <button
            onClick={handleClose}
            className="close-button"
            data-testid="close-modal"
            aria-label="Close"
          >
            <span className="fa-layers">
              <FontAwesomeIcon icon={"circle"} size="2x" inverse />
              <FontAwesomeIcon icon={"times-circle"} size="2x" />
            </span>
          </button>
        </div>
        <div className="border-top border-base-lighter margin-x-neg-205 margin-top-205">
          <Input {...commonInputProps} label="Organization name" field="name" />
          <Input
            {...commonInputProps}
            label="Administrator first name"
            field="adminFirstName"
          />
          <Input
            {...commonInputProps}
            label="Administrator last name"
            field="adminLastName"
          />
          <Input
            {...commonInputProps}
            label="Administrator email"
            field="adminEmail"
          />
          <Input
            {...commonInputProps}
            label="Administrator phone"
            field="adminPhone"
          />
        </div>
        <div className="border-top border-base-lighter margin-x-neg-205 margin-top-5 padding-top-205 text-right">
          <div className="display-flex flex-justify-end">
            <Button
              className="margin-right-2"
              onClick={handleClose}
              variant="unstyled"
              label="Cancel"
            />
            <Button
              className="margin-right-2"
              variant="outline"
              onClick={() => handleDelete(organization)}
              label={isUpdating ? "Deleting..." : "Delete"}
              disabled={isUpdating}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDeleteOrgModal;
