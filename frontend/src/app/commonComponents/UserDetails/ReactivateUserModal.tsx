import React from "react";
import Modal from "react-modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSelector } from "react-redux";

import Button from "../Button/Button";
import { displayFullName } from "../../utils";
import { RootState } from "../../store";
import { SettingsUser } from "../../Settings/Users/ManageUsersContainer";
import "../../Settings/Users/ManageUsers.scss";
import { User } from "../../../generated/graphql";

interface Props {
  onClose: () => void;
  onReactivateUser: (userId: string) => void;
  user: SettingsUser | User;
  isOpen: boolean;
}

export const ORG_ADMIN_REACTIVATE_COPY =
  "Are you sure you want to reactivate this account?";
export const SITE_ADMIN_REACTIVATE_COPY =
  "When you reactivate their account, the user will need to choose a new password. Do you want to reactivate this account?";

const ReactivateUserModal: React.FC<Props> = ({
  onClose,
  onReactivateUser,
  user,
  isOpen,
}) => {
  const loggedInUserIsSiteAdmin = useSelector<RootState, boolean>(
    (state) => state.user.isAdmin
  );

  return (
    <Modal
      isOpen={isOpen}
      style={{
        content: {
          maxHeight: "90vh",
          width: "40em",
          position: "initial",
        },
      }}
      overlayClassName="prime-modal-overlay display-flex flex-align-center flex-justify-center sr-legacy-application"
      contentLabel="Confirm reactivate user"
      ariaHideApp={process.env.NODE_ENV !== "test"}
      onRequestClose={onClose}
    >
      <div className="border-0 card-container">
        <div className="display-flex flex-justify">
          <h1 className="font-sans-lg margin-top-05 margin-bottom-0">
            Reactivate account:{" "}
            {displayFullName(user.firstName, user.middleName, user.lastName)}
          </h1>
          <button onClick={onClose} className="close-button" aria-label="Close">
            <span className="fa-layers">
              <FontAwesomeIcon icon={"circle"} size="2x" inverse />
              <FontAwesomeIcon icon={"times-circle"} size="2x" />
            </span>
          </button>
        </div>
        <div className="border-top border-base-lighter margin-x-neg-205 margin-top-205"></div>
        <div className="grid-row grid-gap">
          <p>
            <strong>
              {displayFullName(user.firstName, user.middleName, user.lastName)}
            </strong>
            's SimpleReport account is currently inactive. They can't log in
            until their account is reactivated.
          </p>
          <p>
            <strong>
              Please note: If this user doesn't log in to SimpleReport before
              6AM EST, their account will be deactivated again.
            </strong>
          </p>
          <p>
            {loggedInUserIsSiteAdmin
              ? SITE_ADMIN_REACTIVATE_COPY
              : ORG_ADMIN_REACTIVATE_COPY}
          </p>
        </div>
        <div className="border-top border-base-lighter margin-x-neg-205 margin-top-5 padding-top-205 text-right">
          <div className="display-flex flex-justify-end">
            <Button
              className="margin-right-2"
              onClick={onClose}
              variant="unstyled"
              label="No, go back"
            />
            <Button
              className="margin-right-205"
              onClick={() => {
                onReactivateUser(user.id);
                onClose();
              }}
              label="Yes, reactivate"
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ReactivateUserModal;
