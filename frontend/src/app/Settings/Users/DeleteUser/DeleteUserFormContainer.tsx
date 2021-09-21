import { useState } from "react";

import { useSetUserIsDeletedMutation } from "../../../../generated/graphql";
import Alert from "../../../commonComponents/Alert";
import { displayFullName, showNotification } from "../../../utils";
import { SettingsUser } from "../ManageUsersContainer";

import DeleteUserForm from "./DeleteUserForm";

interface Props {
  user: SettingsUser;
  isUpdating: boolean;
  loggedInUser: User;
  onDeleteUser: (userId: string) => void;
}

const DeleteUserFormContainer = ({
  user,
  loggedInUser,
  isUpdating,
  onDeleteUser,
}: Props) => {
  const [deleteUser] = useSetUserIsDeletedMutation();
  const [isModalActive, setIsModalActive] = useState(false);
  const fullName = displayFullName(
    user.firstName,
    user.middleName,
    user.lastName
  );

  const showConfirmation = () => {
    setIsModalActive(true);
  };

  const hideConfirmation = () => {
    setIsModalActive(false);
  };

  const handleDeleteUser = async () => {
    try {
      await deleteUser({
        variables: {
          id: user.id,
          deleted: true,
        },
      });
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
    <DeleteUserForm
      disabled={loggedInUser.id === user.id || isUpdating}
      isOpen={isModalActive}
      showModal={showConfirmation}
      fullName={fullName}
      onClose={hideConfirmation}
      onDeleteUser={handleDeleteUser}
    />
  );
};

export default DeleteUserFormContainer;
