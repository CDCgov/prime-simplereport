import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { Tooltip } from "@trussworks/react-uswds";
import React from "react";
import "./TextWithTooltip.scss";
import { IconProp } from "@fortawesome/fontawesome-svg-core";

type CustomButtonProps = React.PropsWithChildren<{
  className?: string;
  children: React.ReactNode;
}> &
  JSX.IntrinsicElements["button"] &
  React.RefAttributes<HTMLButtonElement>;

interface Props {
  tooltip: string;
  position?: "top" | "bottom" | "left" | "right";
  hideText?: boolean;
  text?: string;
  className?: string;
}

export const TextWithTooltip = ({
  tooltip,
  position,
  text,
  hideText,
  className,
}: Props) => {
  const CustomButton: React.ForwardRefExoticComponent<CustomButtonProps> =
    React.forwardRef(
      ({ className, children, ...tooltipProps }: CustomButtonProps, ref) => (
        <button
          className={`usa-button usa-button--unstyled ${className}`}
          ref={ref}
          aria-label={hideText ? `${text} tooltip` : ""}
          {...tooltipProps}
        >
          {children}
        </button>
      )
    );
  function preventPageReload(e: React.MouseEvent) {
    e.preventDefault();
  }
  CustomButton.displayName = "custom button";

  return (
    <Tooltip<CustomButtonProps>
      label={tooltip}
      asCustom={CustomButton}
      position={position || "top"}
      className={className}
      wrapperclasses="usa-text-with-tooltip"
      onClick={preventPageReload}
    >
      {hideText ? "" : text}
      <FontAwesomeIcon
        alt-text="info"
        className="info-circle-icon"
        icon={faInfoCircle as IconProp}
      />
    </Tooltip>
  );
};
