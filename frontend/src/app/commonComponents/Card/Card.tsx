import siteLogo from "../../../img/simplereport-logo-color.svg";

export type CardProps = {
  logo?: boolean;
  bodyKicker?: string;
  bodyKickerCentered?: boolean;
};

export const Card: React.FC<CardProps> = ({
  children,
  logo = false,
  bodyKicker = false,
  bodyKickerCentered = false,
}) => {
  return (
    <div className="card">
      {logo && (
        <header className="display-flex flex-column">
          <img
            className="flex-align-self-center maxw-card-lg width-full"
            src={siteLogo}
            alt="SimpleReport"
          />
          <div className="border-bottom border-base-lighter margin-x-neg-3 margin-top-3"></div>
        </header>
      )}
      {bodyKicker && bodyKickerCentered ? (
        <div className="display-flex flex-column flex-align-center">
          <p className="font-ui-sm text-bold margin-top-3">{bodyKicker}</p>
        </div>
      ) : bodyKicker ? (
        <p className="font-ui-sm text-bold margin-top-3">{bodyKicker}</p>
      ) : null}
      {children}
    </div>
  );
};

export default Card;
