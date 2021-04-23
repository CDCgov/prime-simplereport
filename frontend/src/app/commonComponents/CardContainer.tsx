import siteLogo from "../../img/simplereport-logo-color.svg";

export type CardContainerProps = {
  logo?: boolean;
};

export const CardContainer: React.FC<CardContainerProps> = ({
  children,
  logo = false,
}) => {
  return (
    <div className="bg-base-lightest">
      <div className="grid-container width-mobile-lg usa-section">
        <div className="card">
          {logo && (
            <header className="display-flex flex-column">
              <img className="maxw-card-lg flex-align-self-center" src={siteLogo} alt="SimpleReport" />
              <div className="border-bottom border-base-lighter margin-x-neg-3 margin-top-3"></div>
            </header>
          )}
          {children}
        </div>
      </div>
    </div>
  );
};
