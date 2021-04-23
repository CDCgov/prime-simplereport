import siteLogo from "../../img/simplereport-logo-color.svg";

export type CardProps = {
  logo?: boolean;
};

export const Card: React.FC<CardProps> = ({
  children,
  logo = false,
}) => {
  return (
    <div className="card">
      {logo && (
        <header className="display-flex flex-column">
          <img className="maxw-card-lg flex-align-self-center" src={siteLogo} alt="SimpleReport" />
          <div className="border-bottom border-base-lighter margin-x-neg-3 margin-top-3"></div>
        </header>
      )}
      {children}
    </div>
  );
};

export default Card;