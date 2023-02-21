import { CardLogoHeader } from "./CardLogoHeader";

export type CardProps = {
  logo?: boolean;
  bodyKicker?: string;
  bodyKickerCentered?: boolean;
  children?: React.ReactNode;
  cardIsForm?: boolean;
};

export const Card: React.FC<CardProps> = ({
  children,
  logo = false,
  bodyKicker = false,
  bodyKickerCentered = false,
  cardIsForm = false,
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
      {logo && <CardLogoHeader />}
      {kicker}
      {children}
    </>
  );
  return (
    <>
      {cardIsForm ? (
        <form className="card">{body}</form>
      ) : (
        <div className="card"> {body} </div>
      )}
    </>
  );
};

export default Card;
