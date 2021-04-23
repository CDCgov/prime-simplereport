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
      <div className="grid-container maxw-tablet usa-section">
        <div className="card width-mobile-lg">
          {logo && (
            <header>
              <img src={siteLogo} alt="SimpleReport" />
            </header>
          )}
          {children}
        </div>
      </div>
    </div>
  );
};
