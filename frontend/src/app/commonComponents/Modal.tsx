import React from "react";
import ReactModal from "react-modal";
import classnames from "classnames";
import { faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import iconClose from "../../../node_modules/uswds/dist/img/usa-icons/close.svg";

type ModalVariant = "warning";

interface Props {
  onClose: () => void;
  showModal: boolean;
  showClose?: boolean;
  containerClassName?: string;
  variant?: "warning";
}
interface SubComponents {
  Header: typeof Header;
  Footer: typeof Footer;
}

type IconDefinition = typeof faExclamationCircle;

const variantIcons: Record<ModalVariant, IconDefinition> = {
  warning: faExclamationCircle,
};

const Header: React.FC<{}> = ({ children }) => (
  <h3 className="modal__heading">{children}</h3>
);
const Footer: React.FC<{}> = ({ children }) => (
  <div className="modal__footer">{children}</div>
);

const Modal: React.FC<Props> & SubComponents = ({
  onClose,
  showModal,
  children,
  showClose = true,
  containerClassName,
  variant,
}) => {
  const containerClasses = classnames(
    containerClassName,
    "modal__container",
    variant && "border-left-1 modal__variant",
    variant === "warning" && "border-gold"
  );

  const variantStyles = variant
    ? {
        padding: 0,
        borderRadius: 0,
      }
    : {};

  return (
    <ReactModal
      portalClassName="modal--basic"
      isOpen={showModal}
      onRequestClose={onClose}
      style={{
        content: {
          position: "initial",
          border: 0,
          ...variantStyles,
        },
      }}
      overlayClassName="prime-modal-overlay display-flex flex-align-center flex-justify-center"
      ariaHideApp={process.env.NODE_ENV !== "test"}
    >
      <div className={containerClasses}>
        {showClose && (
          <button
            className="modal__close-button"
            style={{ cursor: "pointer" }}
            onClick={() => onClose()}
          >
            <img className="modal__close-img" src={iconClose} alt="Close" />
          </button>
        )}
        <div className="modal__content grid-row">
          {variant && (
            <div className="grid-col flex-auto margin-right-2">
              <FontAwesomeIcon icon={variantIcons[variant]} size="2x" />
            </div>
          )}
          <div className="grid-col">{children}</div>
        </div>
      </div>
    </ReactModal>
  );
};

Modal.Header = Header;
Modal.Footer = Footer;
export default Modal;
