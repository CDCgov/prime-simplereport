import React from "react";
import Modal from "react-modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import "./ManageUsers.scss";
import Button from "../../commonComponents/Button/Button";

interface BaseEditModalProps {
  heading: String;
  onClose: () => void;
  content: JSX.Element;
  onSubmit: () => void;
  submitDisabled: boolean;
}

export const BaseEditModal: React.FC<BaseEditModalProps> = ({
  heading,
  onClose,
  content,
  onSubmit,
  submitDisabled,
}) => {
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
      contentLabel="Unsaved changes to current user"
      ariaHideApp={process.env.NODE_ENV !== "test"}
      onRequestClose={onClose}
    >
      <div className="border-0 card-container">
        <div className="display-flex flex-justify">
          <h1 className="font-heading-lg margin-top-05 margin-bottom-0">
            {heading}
          </h1>
          <button onClick={onClose} className="close-button" aria-label="Close">
            <span className="fa-layers">
              <FontAwesomeIcon icon={"circle"} size="2x" inverse />
              <FontAwesomeIcon icon={"times-circle"} size="2x" />
            </span>
          </button>
        </div>
        <div className="border-top border-base-lighter margin-x-neg-205 margin-top-205"></div>
        <form onSubmit={onSubmit}>
          <div className="usa-card__body width-card-lg">{content}</div>
          <div className="border-top border-base-lighter margin-x-neg-205 margin-top-5 padding-top-205 text-right">
            <div className="display-flex flex-justify-end">
              <Button
                className="margin-right-2"
                onClick={onClose}
                variant="unstyled"
                label="Cancel"
              />
              <Button
                className="margin-right-205"
                type="submit"
                label="Confirm"
                disabled={submitDisabled}
              />
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default BaseEditModal;
