import Button from "../../../commonComponents/Button/Button";
import Modal from "../../../commonComponents/Modal";

interface Props {
  disabled: boolean;
  isOpen: boolean;
  fullName: string;
  showModal: () => void;
  onClose: () => void;
  onDeleteUser: () => void;
}

const DeleteUserConfirmation = ({
  disabled,
  isOpen,
  fullName,
  showModal,
  onClose,
  onDeleteUser,
}: Props) => (
  <>
    <Button
      variant="outline"
      icon="trash"
      className="flex-align-self-start display-inline-block"
      onClick={showModal}
      label="Remove user"
      disabled={disabled}
    />
    <Modal showModal={isOpen} onClose={onClose}>
      <Modal.Header>Remove user</Modal.Header>
      <p>
        Are you sure you want to remove <strong>{fullName}</strong>?
      </p>
      <p> Doing so will remove this person's access to SimpleReport.</p>
      <Modal.Footer>
        <Button
          className="margin-right-2"
          onClick={onClose}
          variant="unstyled"
          label="No, go back"
        />
        <Button
          className="margin-right-205"
          onClick={onDeleteUser}
          label="Yes, I'm sure"
        />
      </Modal.Footer>
    </Modal>
  </>
);

export default DeleteUserConfirmation;
