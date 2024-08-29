import React, { ReactNode, useState } from "react";

import { SettingsUser } from "../../Settings/Users/ManageUsersContainer";
import { OktaUserStatus } from "../../utils/user";
import Button from "../Button/Button";
import { User } from "../../../generated/graphql";

import ReactivateUserModal from "./ReactivateUserModal";
import ResendActivationEmailModal from "./ResendActivationEmailModal";
import UndeleteUserModal from "./UndeleteUserModal";

export const SpecialStatusNotice: React.FC<{
  user: SettingsUser | User;
  isUpdating: boolean;
  onResendUserActivationEmail: (_userId: string) => void;
  onReactivateUser: (_userId: string) => void;
  onUndeleteUser: () => void;
}> = ({
  user,
  isUpdating,
  onResendUserActivationEmail,
  onReactivateUser,
  onUndeleteUser,
}) => {
  /**
   * Setup labels and modal per status
   */
  let confirmationModal: JSX.Element = <></>;
  let statusDescription: null | ReactNode = null,
    handleStatusBtnLabel: string = "";

  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  const closeModal = () => setShowConfirmationModal(false);
  if (user.isDeleted) {
    confirmationModal = (
      <UndeleteUserModal
        isOpen={showConfirmationModal}
        user={user}
        onClose={closeModal}
        onUndeleteUser={() => {
          onUndeleteUser();
          closeModal();
        }}
      />
    );
    statusDescription = (
      <>
        This user no longer has access to SimpleReport. Click the{" "}
        <span className="text-bold">Undelete user</span> button to restore this
        account
      </>
    );
    handleStatusBtnLabel = "Undelete user";
  } else if (user.status === OktaUserStatus.SUSPENDED) {
    confirmationModal = (
      <ReactivateUserModal
        isOpen={showConfirmationModal}
        user={user}
        onClose={closeModal}
        onReactivateUser={(userId) => {
          onReactivateUser(userId);
          closeModal();
        }}
      />
    );
    statusDescription = "Users are deactivated after 60 days of inactivity.";
    handleStatusBtnLabel = "Activate user";
  } else if (user.status === OktaUserStatus.PROVISIONED) {
    confirmationModal = (
      <ResendActivationEmailModal
        isOpen={showConfirmationModal}
        user={user}
        onClose={closeModal}
        onResendActivationEmail={(userId) => {
          onResendUserActivationEmail(userId);
          closeModal();
        }}
      />
    );
    statusDescription = "This user hasn’t set up their account.";
    handleStatusBtnLabel = "Send account setup email";
  }

  /**
   * HTML
   */
  return statusDescription ? (
    <div className="user-header grid-row flex-row flex-align-center">
      <div className="status-tagline margin-top-105">{statusDescription}</div>
      {handleStatusBtnLabel && (
        <Button
          variant="outline"
          className="margin-left-auto margin-bottom-1"
          onClick={() => setShowConfirmationModal(true)}
          label={handleStatusBtnLabel}
          disabled={isUpdating}
        />
      )}
      {confirmationModal}
    </div>
  ) : null;
};
