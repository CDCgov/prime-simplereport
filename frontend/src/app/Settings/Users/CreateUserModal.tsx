import React from 'react';
import Modal from 'react-modal';

import CreateUserForm from './CreateUserForm';
import { NewUserInvite } from './ManageUsersContainer';

import './ManageUsers.scss';

interface Props {
  onClose: () => void;
  onSubmit: (newUserInvite: NewUserInvite) => void;
  isUpdating: boolean;
}

const CreateUserModal: React.FC<Props> = ({
  onClose,
  onSubmit,
  isUpdating,
}) => {
  return (
    <Modal
      isOpen={true}
      style={{
        content: {
          maxHeight: '90vh',
          width: '40em',
          position: 'initial',
        },
      }}
      overlayClassName="prime-modal-overlay display-flex flex-align-center flex-justify-center"
      contentLabel="Unsaved changes to current user"
      ariaHideApp={process.env.NODE_ENV !== 'test'}
    >
      <CreateUserForm
        onClose={onClose}
        onSubmit={onSubmit}
        isUpdating={isUpdating}
      />
    </Modal>
  );
};

export default CreateUserModal;
