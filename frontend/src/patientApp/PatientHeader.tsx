import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";

import Button from "../app/commonComponents/Button/Button";
import siteLogo from "../img/simplereport-logomark-color.svg";

const PatientHeader = () => {
  const organization = useSelector(
    (state) => (state as any).organization as Organization
  );

  const { t, i18n } = useTranslation();

  return (
    <header className="border-bottom border-base-lighter">
      <div className="display-flex flex-align-center maxw-tablet grid-container flex-justify">
        <div className="padding-y-1">
          <div className="margin-bottom-0" id="basic-logo">
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
                  {organization?.name}
                </span>
                <span className="prime-organization-name margin-left-0 margin-top-05 text-primary-darker">
                  {t("Patient header")}
                </span>
              </div>
            </div>
          </div>
        </div>
        <Button
          className="width-auto"
          variant="unstyled"
          onClick={() => {
            const newLanguage = i18n.language === "en" ? "es" : "en";
            localStorage.setItem("language", newLanguage);
            i18n.changeLanguage(newLanguage);
          }}
        >
          {i18n.language === "en" ? "Español" : "English"}
        </Button>
      </div>
    </header>
  );
};

export default PatientHeader;
