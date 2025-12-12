import React, { useState, useCallback } from "react";
import { useTranslation, Trans } from "react-i18next";

// These explicit imports are required for Jest to be able to load these modules
import iconDotGov from "../../../node_modules/@uswds/uswds/dist/img/icon-dot-gov.svg";
import usFlagSmall from "../../../node_modules/@uswds/uswds/dist/img/us_flag_small.png";
import iconHttps from "../../../node_modules/@uswds/uswds/dist/img/icon-https.svg";

import "./USAGovBanner.scss";

const AccordionContent = () => {
  const { t } = useTranslation();

  return (
    <div
      className="usa-banner__content usa-accordion__content"
      id="gov-banner-default"
    >
      <div className="grid-row grid-gap-lg">
        <div className="usa-banner__guidance tablet:grid-col-6">
          <img
            className="usa-banner__icon usa-media-block__img"
            src={iconDotGov}
            alt="USA Dot Icon"
            aria-hidden="true"
          />
          <div className="usa-media-block__body">
            <p className="text-white">
              <strong>{t("banner.dotGov")}</strong>
              <br />
              {t("banner.dotGovHelper")}
            </p>
          </div>
        </div>
        <div className="usa-banner__guidance tablet:grid-col-6">
          <img
            className="usa-banner__icon usa-media-block__img"
            src={iconHttps}
            role="img"
            alt=""
            aria-hidden="true"
          />
          <div className="usa-media-block__body">
            <p className="text-white">
              <strong>{t("banner.secure")}</strong>
              <br />
              <Trans
                i18nKey="banner.secureHelper"
                components={[<strong key="help-url-prefix">https://</strong>]}
              />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const USAGovBanner = () => {
  const { t } = useTranslation();
  const [isContentVisible, setIsContentVisible] = useState(false);

  const toggleDetails = useCallback(() => {
    setIsContentVisible((prev) => !prev);
  }, [setIsContentVisible]);

  return (
    <section
      className="usa-banner site-banner"
      aria-label={t("banner.officialWebsite")}
    >
      <div className="usa-accordion">
        <header className="usa-banner__header">
          <div className="usa-banner__inner">
            <div className="grid-col-auto">
              <img
                className="usa-banner__header-flag"
                src={usFlagSmall}
                aria-hidden="true"
                alt="USA Flag"
              />
            </div>
            <div
              className="grid-col-fill tablet:grid-col-auto"
              aria-hidden="true"
            >
              <p className="usa-banner__header-text">
                {t("banner.officialWebsite")}
              </p>
              <p className="usa-banner__header-action">
                {t("banner.howYouKnow")}
              </p>
            </div>
            <button
              className="usa-accordion__button usa-banner__button"
              aria-expanded={isContentVisible}
              aria-controls="gov-banner"
              aria-label={"Here's how you know this is an official website"}
              type="button"
              onClick={toggleDetails}
            >
              <span className="usa-banner__button-text">
                {t("banner.howYouKnow")}
              </span>
            </button>
          </div>
        </header>

        {isContentVisible && <AccordionContent />}
      </div>
    </section>
  );
};

export default USAGovBanner;
