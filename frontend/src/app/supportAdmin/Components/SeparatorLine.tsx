import "./SeparatorLine.scss";
import React from "react";
import classnames from "classnames";

interface Props {
  classNames?: string;
}
const SeparatorLine: React.FC<Props> = ({ classNames }) => {
  return <div className={classnames("sr-separator-line", classNames)} />;
};

export default SeparatorLine;
