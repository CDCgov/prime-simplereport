import React from "react";
import Modal from "react-modal";

import CreateUserForm from "./CreateUserForm";
import { NewUserInvite } from "./ManageUsersContainer";

import "./ManageUsers.scss";

interface Props {
  onClose: () => void;
  onSubmit: (newUserInvite: NewUserInvite) => void;
}

const CreateUserModal: React.FC<Props> = ({ onClose, onSubmit }) => {
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
    >
      <CreateUserForm onClose={onClose} onSubmit={onSubmit} />
    </Modal>
  );
};

export default CreateUserModal;
