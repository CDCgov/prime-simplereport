import "../styles/fontAwesome";
import "./PatientHeader.scss";
import React from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import siteLogo from "../img/simplereport-logomark-color.svg";
import { RootState } from "../app/store";
import { Patient } from "../app/patients/ManagePatients";
import USAGovBanner from "../app/commonComponents/USAGovBanner";

import LanguageToggler from "./LanguageToggler";

const PatientHeader = () => {
  const organization = useSelector(
    (state) => (state as any).organization as Organization
  );

  const patient = useSelector<RootState, Patient>((state) => state.patient);
  const organizationName = organization?.name;
  const facilityName = patient?.lastTest?.facilityName;

  const { t } = useTranslation("translation");

  return (
    <header className="header border-bottom border-base-lighter">
      <USAGovBanner />

      <div className="display-flex flex-align-center maxw-tablet grid-container patient-header">
        <div className="padding-y-1">
          <div className="margin-bottom-0" id="basic-logo">
            <div
              className="display-flex flex-align-center"
              title="SimpleReport"
            >
              <img
                className="width-4"
                src={siteLogo}
                alt={process.env.REACT_APP_TITLE}
              />
              <div className="logo-text margin-left-1 display-flex flex-column">
                <span
                  className="prime-organization-name margin-left-0 font-body-md text-bold text-base-lighter"
                  data-testid="banner-text"
                >
                  {organizationName &&
                    facilityName &&
                    `${organizationName}, ${facilityName}`}
                </span>
                <span className="prime-organization-name margin-left-0 margin-top-05 text-base-lighter">
                  {t("header")}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="display-flex flex-align-end">
          <LanguageToggler />
        </div>
      </div>
    </header>
  );
};

export default PatientHeader;
