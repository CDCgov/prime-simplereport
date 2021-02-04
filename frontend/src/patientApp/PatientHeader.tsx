import { useSelector } from "react-redux";
import siteLogo from "../img/simplereport-logomark-color.svg";

const PatientHeader = () => {
  const organization = useSelector(
    (state) => (state as any).organization as Organization
  );

  return (
    <header className="usa-header usa-header--basic">
      <div className="usa-nav-container display-flex flex-align-center maxw-tablet">
        <div className="usa-navbar padding-y-1">
          <div className="usa-logo margin-bottom-0" id="basic-logo">
            <div
              className="display-flex flex-align-center"
              title="Home"
              aria-label="Home"
            >
              <img
                className="width-4"
                src={siteLogo}
                alt="{process.env.REACT_APP_TITLE}"
              />
              <div className="logo-text margin-left-1 display-flex flex-column">
                <span className="prime-organization-name margin-left-0 font-body-md text-primary-darker text-bold">
                  {organization.name}
                </span>
                <span className="prime-organization-name margin-left-0 margin-top-05 text-primary-darker">
                  COVID-19 Testing Portal
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default PatientHeader;
