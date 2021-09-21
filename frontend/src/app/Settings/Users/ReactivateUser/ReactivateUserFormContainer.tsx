import { useState } from "react";

import { useReactivateUserMutation } from "../../../../generated/graphql";
import Alert from "../../../commonComponents/Alert";
import { displayFullName, showNotification } from "../../../utils";
import { SettingsUser } from "../ManageUsersContainer";

import ReactivateUserModal from "./ReactivateUserForm";

interface Props {
  user: SettingsUser;
  isUpdating: boolean;
  onReactivateUser: () => void;
}

const ReactivateUserFormContainer = ({
  user,
  isUpdating,
  onReactivateUser,
}: Props) => {
  const [reactivateUser] = useReactivateUserMutation();
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

  const handleReactivateUser = async () => {
    try {
      await reactivateUser({
        variables: {
          id: user.id,
        },
      });
      hideConfirmation();
      showNotification(
        <Alert type="success" title={`${fullName} has been reactivated.`} />
      );
      await onReactivateUser();
    } catch (e) {
      throw e;
    }
  };

  if (user.status !== "SUSPENDED") {
    return null;
  }

  return (
    <ReactivateUserModal
      disabled={isUpdating}
      isOpen={isModalActive}
      fullName={fullName}
      showModal={showConfirmation}
      onClose={hideConfirmation}
      onReactivateUser={handleReactivateUser}
    />
  );
};

export default ReactivateUserFormContainer;
