import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { Tooltip } from "@trussworks/react-uswds";
import React from "react";
import "./TextWithTooltip.scss";

type CustomButtonProps = React.PropsWithChildren<{
  className?: string;
}> &
  JSX.IntrinsicElements["button"] &
  React.RefAttributes<HTMLButtonElement>;

interface Props {
  tooltip: string;
  position?: "top" | "bottom" | "left" | "right";
  buttonLabel?: string;
  text?: string;
  className?: string;
}

export const TextWithTooltip = ({
  tooltip,
  position,
  text,
  buttonLabel,
  className,
}: Props) => {
  const CustomButton: React.ForwardRefExoticComponent<CustomButtonProps> =
    React.forwardRef(
      ({ className, children, ...tooltipProps }: CustomButtonProps, ref) => (
        <button
          className={`usa-button usa-button--unstyled ${className}`}
          ref={ref}
          aria-label={`${buttonLabel} tooltip`}
          {...tooltipProps}
        >
          {children}
        </button>
      )
    );

  CustomButton.displayName = "custom button";

  return (
    <Tooltip<CustomButtonProps>
      label={tooltip}
      asCustom={CustomButton}
      position={position || "top"}
      className={className}
      wrapperclasses="usa-text-with-tooltip"
    >
      {text}
      <FontAwesomeIcon
        alt-text="info"
        className="info-circle-icon"
        icon={faInfoCircle}
      />
    </Tooltip>
  );
};
