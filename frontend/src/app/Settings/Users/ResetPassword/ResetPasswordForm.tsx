import Button from "../../../commonComponents/Button/Button";
import Modal from "../../../commonComponents/Modal";

interface Props {
  isOpen: boolean;
  disabled: boolean;
  showModal: () => void;
  onClose: () => void;
  onResetPassword: () => void;
  fullName: string;
}

const ResetPasswordForm = ({
  isOpen,
  disabled,
  showModal,
  onClose,
  onResetPassword,
  fullName,
}: Props) => (
  <>
    <Button
      variant="outline"
      className="margin-left-auto margin-bottom-1"
      onClick={showModal}
      label={"Reset password"}
      disabled={disabled}
    />
    <Modal showModal={isOpen} onClose={onClose}>
      <Modal.Header>Reset {fullName} password</Modal.Header>
      <p>
        Are you sure you want to reset the password for{" "}
        <strong>{fullName}</strong>?
      </p>
      <p>
        {" "}
        Doing so will email this person a link to reset their password. The link
        will expire in 24 hours.
      </p>

      <Modal.Footer>
        <Button
          className="margin-right-2"
          onClick={onClose}
          variant="unstyled"
          label="No, go back"
        />
        <Button
          className="margin-right-205"
          onClick={onResetPassword}
          label="Yes, I'm sure"
        />
      </Modal.Footer>
    </Modal>
  </>
);

export default ResetPasswordForm;
