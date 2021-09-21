import { useState } from "react";

import { useSetUserIsDeletedMutation } from "../../../../generated/graphql";
import Alert from "../../../commonComponents/Alert";
import Button from "../../../commonComponents/Button/Button";
import { displayFullName, showNotification } from "../../../utils";
import { SettingsUser } from "../ManageUsersContainer";

import DeleteUserModal from "./DeleteUserModal";

interface Props {
  user: SettingsUser;
  isUpdating: boolean;
  loggedInUser: User;
  onDeleteUser: (userId: string) => void;
}

const DeleteUserForm = ({
  user,
  loggedInUser,
  isUpdating,
  onDeleteUser,
}: Props) => {
  const [deleteUser] = useSetUserIsDeletedMutation();
  const [showDeleteUserModal, updateShowDeleteUserModal] = useState(false);

  const showConfirmation = () => {
    updateShowDeleteUserModal(true);
  };

  const hideConfirmation = () => {
    updateShowDeleteUserModal(false);
  };

  const handleDeleteUser = async () => {
    try {
      await deleteUser({
        variables: {
          id: user.id,
          deleted: true,
        },
      });
      const fullName = displayFullName(
        user.firstName,
        user.middleName,
        user.lastName
      );
      hideConfirmation();
      showNotification(
        <Alert type="success" title={`User account removed for ${fullName}`} />
      );
      await onDeleteUser(user.id);
    } catch (e) {
      throw e;
    }
  };

  return (
    <>
      <Button
        variant="outline"
        icon="trash"
        className="flex-align-self-start display-inline-block"
        onClick={showConfirmation}
        label="Remove user"
        disabled={loggedInUser.id === user.id || isUpdating}
      />
      <DeleteUserModal
        isOpen={showDeleteUserModal}
        user={user}
        onClose={hideConfirmation}
        onDeleteUser={handleDeleteUser}
      />
    </>
  );
};

export default DeleteUserForm;
