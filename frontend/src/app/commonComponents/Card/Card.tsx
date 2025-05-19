import classNames from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CardLogoHeader } from "./CardLogoHeader";
import Button from "../Button/Button";

export type CardProps = {
  className?: string;
  logo?: boolean;
  bodyKicker?: string;
  bodyKickerCentered?: boolean;
  children?: React.ReactNode;
  cardIsForm?: boolean;
  closeAction?: () => void;
  closeLabel?: string;
};

export const Card: React.FC<CardProps> = ({
  children,
  className,
  logo = false,
  bodyKicker = false,
  bodyKickerCentered = false,
  cardIsForm = false,
  closeAction,
  closeLabel
}) => {
  let kicker = null;
  if (bodyKicker && bodyKickerCentered) {
    kicker = (
      <div className="display-flex flex-column flex-align-center">
        <p className="font-ui-sm text-bold margin-top-3">{bodyKicker}</p>
      </div>
    );
  } else if (bodyKicker) {
    kicker = <p className="font-ui-sm text-bold margin-top-3">{bodyKicker}</p>;
  }
  const body = (
    <>
      {closeAction && (
        <div className="position-absolute top-0 right-0 margin-3">
          <Button
            className="close-button usa-button--unstyled text-black margin-top-0"
            onClick={closeAction}
          >
            <FontAwesomeIcon
              aria-hidden={false}
              fontSize={24}
              icon={"times"}
              aria-label={closeLabel}
            />
          </Button>
        </div>
      )}
      {logo && <CardLogoHeader />}
      {kicker}
      {children}
    </>
  );

  const ContainerEl = cardIsForm ? "form" : "div";

  return <ContainerEl className={classNames("card", className)}>{body}</ContainerEl>;
};

export default Card;
