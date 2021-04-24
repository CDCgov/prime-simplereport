import siteLogo from "../../../img/simplereport-logo-color.svg";

export type CardProps = {
  logo?: boolean;
  bodyHeading?: string;
};

export const Card: React.FC<CardProps> = ({
  children,
  logo = false,
  bodyHeading = false,
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
      {bodyHeading && (
        <h1 className="font-ui-sm margin-top-3">{bodyHeading}</h1>
      )}
      {children}
    </div>
  );
};

export default Card;
