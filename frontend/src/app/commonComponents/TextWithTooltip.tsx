import { Tooltip } from "@trussworks/react-uswds";
import React from "react";

type CustomButtonProps = React.PropsWithChildren<{
  className?: string;
}> &
  JSX.IntrinsicElements["button"] &
  React.RefAttributes<HTMLButtonElement>;

interface Props {
  text: string;
  tooltip: string;
  position?: "top" | "bottom" | "left" | "right";
}

export const TextWithTooltip = ({ text, tooltip, position }: Props) => {
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
      wrapperclasses="usa-text-with-tooltip"
    >
      {text}
    </Tooltip>
  );
};
