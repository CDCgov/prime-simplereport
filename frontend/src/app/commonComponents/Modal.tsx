import React from "react";
import ReactModal from "react-modal";

import iconClose from "../../../node_modules/uswds/dist/img/usa-icons/close.svg";

const Header: React.FC<{}> = ({ children }) => (
  <h3 className="modal__heading">{children}</h3>
);
const Footer: React.FC<{}> = ({ children }) => (
  <div className="modal__footer">{children}</div>
);

interface Props {
  onClose: () => void;
  showModal: boolean;
}
interface SubComponents {
  Header: typeof Header;
  Footer: typeof Footer;
}

const Modal: React.FC<Props> & SubComponents = ({
  onClose,
  showModal,
  children,
}) => {
  return (
    <ReactModal
      portalClassName="modal--basic"
      isOpen={showModal}
      onRequestClose={onClose}
      style={{
        content: {
          position: "initial",
        },
      }}
      overlayClassName="prime-modal-overlay display-flex flex-align-center flex-justify-center"
    >
      <div className="modal__container">
        <button
          className="modal__close-button"
          style={{ cursor: "pointer" }}
          onClick={() => onClose()}
        >
          <img className="modal__close-img" src={iconClose} alt="Close" />
        </button>
        <div className="modal__content">{children}</div>
      </div>
    </ReactModal>
  );
};

Modal.Header = Header;
Modal.Footer = Footer;
export default Modal;
