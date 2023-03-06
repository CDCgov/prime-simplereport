import siteLogo from "../../../img/simplereport-logo-color.svg";

export const CardLogoHeader: React.FC = () => {
  return (
    <header className="display-flex flex-column">
      <img
        className="flex-align-self-center maxw-card-lg width-full"
        src={siteLogo}
        alt="SimpleReport logo"
      />
      <div className="border-bottom border-base-lighter margin-x-neg-3 margin-top-3"></div>
    </header>
  );
};
