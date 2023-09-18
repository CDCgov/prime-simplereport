import classNames from "classnames";
import { CSSTransition } from "react-transition-group";

import iconLoader from "../../../img/loader.svg";

import "./TestCardSubmitLoader.scss";

type Props = {
  name: string;
  show: boolean;
};

export const TestCardSubmitLoader = ({ name, show }: Props) => {
  const classnames = classNames(
    "test-card-submit-loader",
    "z-top",
    "position-absolute",
    "height-full",
    "width-full",
    "text-center"
  );

  return (
    <CSSTransition in={show} timeout={300} classNames="test-card-submit-loader">
      <div className={classnames} aria-hidden={!show}>
        <h4>Submitting test data for {name}...</h4>
        <img src={iconLoader} alt="submitting" className="square-5" />
      </div>
    </CSSTransition>
  );
};
