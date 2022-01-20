import React from "react";
import Modal from "react-modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Button from "../../../commonComponents/Button/Button";
import TextInput from "../../../commonComponents/TextInput";

import { DeletionModalProps } from "./modal_utils";

const ConfirmDeleteOrgModal: React.FC<DeletionModalProps> = ({
  organization,
  handleClose,
  handleDelete,
  isUpdating,
}) => {
  const commonInputProps = {
    disabled: true,
    required: false,
    // don't do anything on change because input fields are for display purposes
    // only
    onChange: () => {},
  };
  return (
    <Modal
      isOpen={true}
      style={{
        content: {
          maxHeight: "90vh",
          width: "40em",
          position: "initial",
        },
      }}
      overlayClassName="prime-modal-overlay display-flex flex-align-center flex-justify-center"
      contentLabel="Deletion confirmation for pending organizations"
      ariaHideApp={process.env.NODE_ENV !== "test"}
    >
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
        <div className="border-top border-base-lighter margin-x-neg-205 margin-top-205"></div>
        <div>
          <TextInput
            {...commonInputProps}
            label="Organization name"
            name="Organization name"
            value={organization.name}
          />
          <TextInput
            {...commonInputProps}
            name="Created at"
            label="Created at"
            value={organization.createdAt}
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
              onClick={() => handleDelete(organization)}
              id="confirm-deletion-button"
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
