import { useState } from "react";

import Alert from "../../../commonComponents/Alert";
import { SettingsUser } from "../ManageUsersContainer";
import { useResetUserPasswordMutation } from "../../../../generated/graphql";
import { displayFullName, showNotification } from "../../../utils";

import ResetPasswordForm from "./ResetPasswordForm";

interface Props {
  user: SettingsUser;
  isUpdating: boolean;
  loggedInUser: User;
}

const ResetPasswordFormContainer = ({
  user,
  loggedInUser,
  isUpdating,
}: Props) => {
  const [showResetPasswordModal, updateShowResetPasswordModal] = useState(
    false
  );
  const [resetPassword] = useResetUserPasswordMutation();
  const fullName = displayFullName(
    user.firstName,
    user.middleName,
    user.lastName
  );
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
      <ResetPasswordForm
        disabled={isUpdating}
        isOpen={showResetPasswordModal}
        fullName={fullName}
        showModal={showConfirmation}
        onClose={hideConfirmation}
        onResetPassword={handleResetUserPassword}
      />
    </>
  );
};

export default ResetPasswordFormContainer;
