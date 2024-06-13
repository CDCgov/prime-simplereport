import React from "react";
import ReactModal from "react-modal";
import classnames from "classnames";
import { faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconProp } from "@fortawesome/fontawesome-svg-core";

import iconClose from "../../img/close.svg";

type ModalVariantWithIcon = "warning";
type ModalVariant = ModalVariantWithIcon | "mobile-lg";

interface Props {
  onClose: () => void;
  showModal: boolean;
  contentLabel: string;
  showClose?: boolean;
  containerClassName?: string;
  variant?: ModalVariant | null;
  title?: string;
  children?: React.ReactNode;
}

type IconDefinition = typeof faExclamationCircle;

const variantIcons: Record<ModalVariant, IconDefinition | null> = {
  warning: faExclamationCircle,
  "mobile-lg": null,
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

const getVariantModalStyles = (variant: ModalVariant | null) => {
  switch (variant) {
    case "mobile-lg":
      return {
        width: 480,
      };
    case "warning":
      return {
        borderRadius: 0,
      };
    default:
      return {};
  }
};

const getVariantContainerClasses = (variant: ModalVariant | null) => {
  if (variant === "warning") {
    return "border-left-1 modal__variant border-gold";
  } else {
    return "";
  }
};

const getVariantMainElemClasses = (variant: ModalVariant | null) => {
  switch (variant) {
    case "mobile-lg":
      return "padding-4";
    case "warning":
      return "";
    default:
      return "padding-205";
  }
};

const Modal = ({
  onClose,
  showModal,
  children,
  showClose = true,
  containerClassName,
  variant = null,
  contentLabel,
}: Props): JSX.Element => {
  const containerClasses = classnames(
    "modal__container",
    containerClassName,
    getVariantContainerClasses(variant)
  );

  return (
    <ReactModal
      portalClassName="modal--basic"
      isOpen={showModal}
      onRequestClose={onClose}
      style={{
        content: {
          position: "initial",
          border: 0,
          padding: 0,
          ...getVariantModalStyles(variant),
        },
      }}
      overlayClassName="prime-modal-overlay display-flex flex-align-center flex-justify-center"
      ariaHideApp={process.env.NODE_ENV !== "test"}
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
        <main className={getVariantMainElemClasses(variant)}>
          <div className="modal__content grid-row usa-prose">
            {variant && variantIcons[variant] && (
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
