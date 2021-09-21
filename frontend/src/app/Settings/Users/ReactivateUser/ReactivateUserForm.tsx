import { useState } from "react";

import { useReactivateUserMutation } from "../../../../generated/graphql";
import Alert from "../../../commonComponents/Alert";
import Button from "../../../commonComponents/Button/Button";
import { displayFullName, showNotification } from "../../../utils";
import { SettingsUser } from "../ManageUsersContainer";

import ReactivateUserModal from "./ReactivateUserModal";

interface Props {
  user: SettingsUser;
  isUpdating: boolean;
  onReactivateUser: () => void;
}

const ReactivateUserForm = ({ user, isUpdating, onReactivateUser }: Props) => {
  const [showReactivateUserModal, updateShowReactivateUserModal] = useState(
    false
  );
  const [reactivateUser] = useReactivateUserMutation();

  const handleReactivateUser = async () => {
    try {
      await reactivateUser({
        variables: {
          id: user.id,
        },
      });
      const fullName = displayFullName(
        user.firstName,
        user.middleName,
        user.lastName
      );
      updateShowReactivateUserModal(false);
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
    <>
      <Button
        variant="secondary"
        className="margin-left-auto margin-bottom-1"
        onClick={() => updateShowReactivateUserModal(true)}
        label="Reactivate user"
        disabled={isUpdating}
      />
      <ReactivateUserModal
        isOpen={showReactivateUserModal}
        user={user}
        onClose={() => updateShowReactivateUserModal(false)}
        onReactivateUser={handleReactivateUser}
      />
    </>
  );
};

export default ReactivateUserForm;
