import Button from "../../../commonComponents/Button/Button";
import Modal from "../../../commonComponents/Modal";

interface Props {
  disabled: boolean;
  isOpen: boolean;
  showModal: () => void;
  onClose: () => void;
  onReactivateUser: () => void;
  fullName: string;
}

const ReactivateUserForm = ({
  disabled,
  isOpen,
  showModal,
  onClose,
  onReactivateUser,
  fullName,
}: Props) => (
  <>
    <Button
      variant="secondary"
      className="margin-left-auto margin-bottom-1"
      onClick={showModal}
      label="Reactivate user"
      disabled={disabled}
    />
    <Modal showModal={isOpen} onClose={onClose}>
      <Modal.Header>Reactivate account:{` ${fullName}`}</Modal.Header>
      <p>
        <strong>{fullName}</strong>
        's SimpleReport account is currently inactive. They can't log in until
        their account is reactivated.
      </p>
      <p>
        <strong>
          Please note: Users will have 24 hours to log back in to SimpleReport.
        </strong>
      </p>
      <p>Are you sure you want to reactivate this account?</p>
      <Modal.Footer>
        <Button
          className="margin-right-2"
          onClick={onClose}
          variant="unstyled"
          label="No, go back"
        />
        <Button
          className="margin-right-205"
          onClick={onReactivateUser}
          label="Yes, reactivate"
        />
      </Modal.Footer>
    </Modal>
  </>
);

export default ReactivateUserForm;
