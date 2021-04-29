import siteLogo from "../../../img/simplereport-logo-color.svg";

export type CardProps = {
  logo?: boolean;
  bodyKicker?: string;
};

export const Card: React.FC<CardProps> = ({
  children,
  logo = false,
  bodyKicker = false,
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
      {bodyKicker && (
        <p className="font-ui-sm text-bold margin-top-3">{bodyKicker}</p>
      )}
      {children}
    </div>
  );
};

export default Card;
