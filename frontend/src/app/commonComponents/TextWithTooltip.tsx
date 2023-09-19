import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { Tooltip } from "@trussworks/react-uswds";
import { IconProp } from "@fortawesome/fontawesome-svg-core";

import "./TextWithTooltip.scss";

type CustomButtonProps = React.PropsWithChildren<{
  className?: string;
  children: React.ReactNode;
  text?: string;
  hideText?: boolean;
}> &
  JSX.IntrinsicElements["button"] &
  React.RefAttributes<HTMLButtonElement>;

const CustomButtonForwardRef: React.ForwardRefRenderFunction<
  HTMLButtonElement,
  CustomButtonProps
> = (
  { className, children, hideText, text, ...tooltipProps }: CustomButtonProps,
  ref
) => (
  <button
    className={`usa-button usa-button--unstyled ${className}`}
    ref={ref}
    aria-label={hideText ? `${text} tooltip` : ""}
    {...tooltipProps}
  >
    {children}
  </button>
);

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
  function preventPageReload(e: React.MouseEvent) {
    e.preventDefault();
  }
  const CustomButton = React.forwardRef(CustomButtonForwardRef);

  return (
    <Tooltip<CustomButtonProps>
      label={tooltip}
      asCustom={CustomButton}
      position={position || "top"}
      className={className}
      text={text}
      hideText={hideText}
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
