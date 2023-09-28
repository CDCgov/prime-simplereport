import classNames from "classnames";
import { useFeature } from "flagged";
import { CSSTransition } from "react-transition-group";

import iconLoader from "../../img/loader.svg";

import "./QueueItemSubmitLoader.scss";

type Props = {
  name: string;
  show: boolean;
};

export const QueueItemSubmitLoader = ({ name, show }: Props) => {
  const testCardRefactorEnabled = useFeature(
    "testCardRefactorEnabled"
  ) as boolean;

  const classnames = classNames(
    "sr-queue-item-submit-loader",
    "z-top",
    "position-absolute",
    "height-full",
    "width-full",
    "text-center",
    testCardRefactorEnabled ? "test-card-submit-loader" : "radius-lg"
  );

  const headingClassNames = testCardRefactorEnabled
    ? ""
    : classNames("margin-top-6", "margin-bottom-5");

  return (
    <CSSTransition
      in={show}
      timeout={300}
      classNames="sr-queue-item-submit-loader"
    >
      <div className={classnames} aria-hidden={!show}>
        <h4 className={headingClassNames}>
          Submitting test data for {name}...
        </h4>
        <img src={iconLoader} alt="submitting" className="square-5" />
      </div>
    </CSSTransition>
  );
};
