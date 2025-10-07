import React from "react";
import ReactModal from "react-modal";
import classnames from "classnames";
import { faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconProp } from "@fortawesome/fontawesome-svg-core";

import iconClose from "../../img/close.svg";

type ModalVariant = "warning";

interface Props {
  onClose: () => void;
  showModal: boolean;
  contentLabel: string;
  showClose?: boolean;
  containerClassName?: string;
  variant?: "warning";
  title?: string;
  children?: React.ReactNode;
}

type IconDefinition = typeof faExclamationCircle;

const variantIcons: Record<ModalVariant, IconDefinition> = {
  warning: faExclamationCircle,
};

type HeaderProps = {
  children?: React.ReactNode;
  styleClassNames?: string;
};

const Header: React.FC<HeaderProps> = ({ children, styleClassNames }) => (
  <h1 className={"modal__heading " + styleClassNames}>{children}</h1>
);

type FooterProps = {
  children?: React.ReactNode;
  styleClassNames?: string;
};

const Footer: React.FC<FooterProps> = ({ children, styleClassNames }) => (
  <div className={"modal__footer " + styleClassNames}>{children}</div>
);

const Modal = ({
  onClose,
  showModal,
  children,
  showClose = true,
  containerClassName,
  variant,
  contentLabel,
}: Props): JSX.Element => {
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
      ariaHideApp={import.meta.env.MODE !== "test"}
      contentLabel={contentLabel}
    >
      <div className={containerClasses}>
        {showClose && (
          <button
            className="modal__close-button"
            style={{ cursor: "pointer", zIndex: "1" }}
            onClick={() => onClose()}
          >
            <img className="modal__close-img" src={iconClose} alt="Close" />
          </button>
        )}
        <main>
          <div className="modal__content grid-row">
            {variant && (
              <div className="grid-col flex-auto margin-right-2">
                <FontAwesomeIcon
                  icon={variantIcons[variant] as IconProp}
                  size="2x"
                />
              </div>
            )}
            <div className="grid-col">{children}</div>
          </div>
        </main>
      </div>
    </ReactModal>
  );
};

Modal.Header = Header;
Modal.Footer = Footer;
export default Modal;
