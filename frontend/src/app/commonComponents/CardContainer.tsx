import siteLogo from "../../img/simplereport-logo-color.svg";

export type CardContainerProps = {
  logo?: boolean;
};

export const CardContainer: React.FC<CardContainerProps> = ({
  children,
  logo = false,
}) => {
  return (
    <div className="bg-base-lightest display-flex flex-align-center">
      <div className="card width-mobile-lg">
        {logo && (
          <header>
            <img src={siteLogo} alt="Simple Report" />
          </header>
        )}
        {children}
      </div>
    </div>
  );
};
