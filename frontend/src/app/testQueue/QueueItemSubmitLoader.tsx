import classNames from "classnames";
import { CSSTransition } from "react-transition-group";

import iconLoader from "../../img/loader.svg";

import "./QueueItemSubmitLoader.scss";

type Props = {
  name: string;
  show: boolean;
};

export const QueueItemSubmitLoader = ({ name, show }: Props) => {
  const classnames = classNames(
    "sr-queue-item-submit-loader",
    "z-top",
    "position-absolute",
    "height-full",
    "width-full",
    "text-center",
    "test-card-submit-loader"
  );

  return (
    <CSSTransition
      in={show}
      timeout={300}
      classNames="sr-queue-item-submit-loader"
    >
      <div className={classnames} aria-hidden={!show}>
        <h4>Submitting test data for {name}...</h4>
        <img src={iconLoader} alt="submitting" className="square-5" />
      </div>
    </CSSTransition>
  );
};
