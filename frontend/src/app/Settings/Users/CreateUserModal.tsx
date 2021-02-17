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
          marginRight: "50%",
          overflow: "auto",
          height: "60%",
          width: "40%",
          minWidth: "20em",
          maxHeight: "100vh",
          padding: "0",
          transform: "translate(70%, 25%)",
        },
      }}
      overlayClassName="prime-modal-overlay"
      contentLabel="Unsaved changes to current user"
    >
      <CreateUserForm onClose={onClose} onSubmit={onSubmit} />
    </Modal>
  );
};

export default CreateUserModal;
