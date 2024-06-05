import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import "./TextWithTooltip.scss";
import { Button } from "@trussworks/react-uswds";

interface Props {
  text?: string;
  onClick: () => void;
}

export const TextWithTooltipButton = ({ text, onClick }: Props) => {
  return (
    <Button
      type={"button"}
      unstyled
      className={"margin-top-05em"}
      onClick={onClick}
    >
      <FontAwesomeIcon
        alt-text="info"
        className="info-circle-icon margin-right-05em"
        icon={faInfoCircle as IconProp}
      />
      <strong className={"font-body-2xs"}>{text}</strong>
    </Button>
  );
};
