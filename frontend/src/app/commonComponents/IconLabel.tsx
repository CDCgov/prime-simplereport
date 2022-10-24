import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import { IconProp } from "@fortawesome/fontawesome-svg-core";

interface Props {
  icon: IconProp;
  primaryText: string;
  secondaryText?: string;
}
// todo: fix spacing on secondary text
export const IconLabel = (props: Props) => (
  <span>
    <FontAwesomeIcon icon={props.icon} />
    <span
      style={{
        fontSize: "16px",
        color: "#005AE2",
        marginLeft: "12px",
      }}
    >
      {props.primaryText}
      <div
        style={{
          fontSize: "13px",
          color: "#71767A",
          paddingBottom: "10px",
          paddingLeft: "28px",
        }}
      >
        {props.secondaryText}
      </div>
    </span>
  </span>
);
