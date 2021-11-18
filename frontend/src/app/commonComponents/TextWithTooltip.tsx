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
  text: string;
  tooltip: string;
  position?: "top" | "bottom" | "left" | "right";
  className?: string;
}

export const TextWithTooltip = ({
  text,
  tooltip,
  position,
  className,
}: Props) => {
  const CustomButton: React.ForwardRefExoticComponent<CustomButtonProps> = React.forwardRef(
    ({ className, children, ...tooltipProps }: CustomButtonProps, ref) => (
      <button
        className={`usa-button usa-button--unstyled ${className}`}
        ref={ref}
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
        className="info-circle-icon"
        icon={faInfoCircle}
        color="black"
        size="xs"
      />
    </Tooltip>
  );
};
