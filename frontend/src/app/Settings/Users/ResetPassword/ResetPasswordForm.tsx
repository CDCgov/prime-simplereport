import { useState } from "react";

import Alert from "../../../commonComponents/Alert";
import Button from "../../../commonComponents/Button/Button";
import { SettingsUser } from "../ManageUsersContainer";
import { useResetUserPasswordMutation } from "../../../../generated/graphql";
import { displayFullName, showNotification } from "../../../utils";

import ResetUserPasswordModal from "./ResetUserPasswordModal";

interface Props {
  user: SettingsUser;
  isUpdating: boolean;
  loggedInUser: User;
}

const ResetPasswordForm = ({ user, loggedInUser, isUpdating }: Props) => {
  const [showResetPasswordModal, updateShowResetPasswordModal] = useState(
    false
  );
  const [resetPassword] = useResetUserPasswordMutation();

  const showConfirmation = () => {
    updateShowResetPasswordModal(true);
  };

  const hideConfirmation = () => {
    updateShowResetPasswordModal(false);
  };

  const handleResetUserPassword = async () => {
    try {
      await resetPassword({
        variables: {
          id: user.id,
        },
      });
      const fullName = displayFullName(
        user.firstName,
        user?.middleName,
        user?.lastName
      );
      hideConfirmation();
      showNotification(
        <Alert type="success" title={`Password reset for ${fullName}`} />
      );
    } catch (e) {
      throw e;
    }
  };

  if (user.status === "SUSPENDED") {
    return null;
  }
  if (user.id === loggedInUser.id) {
    return null;
  }
  return (
    <>
      <Button
        variant="outline"
        className="margin-left-auto margin-bottom-1"
        onClick={showConfirmation}
        label={"Reset password"}
        disabled={isUpdating}
      />
      <ResetUserPasswordModal
        isOpen={showResetPasswordModal}
        user={user}
        onClose={hideConfirmation}
        onResetPassword={handleResetUserPassword}
      />
    </>
  );
};

export default ResetPasswordForm;
