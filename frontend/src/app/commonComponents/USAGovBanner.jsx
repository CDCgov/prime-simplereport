import React from "react";
import { Trans } from "react-i18next";

import i18n from "../../i18n";
import iconDotGov from "../../../node_modules/uswds/dist/img/icon-dot-gov.svg";
import usFlagSmall from "../../../node_modules/uswds/dist/img/us_flag_small.png";
import iconHttps from "../../../node_modules/uswds/dist/img/icon-https.svg";

export default class USAGovBanner extends React.Component {
  constructor() {
    super();
    this.state = {
      contentVisible: false,
    };
  }
  // Toggles the visiblity of the content section.
  toggleDetails() {
    this.setState({ contentVisible: !this.state.contentVisible });
  }

  renderAccordionContent() {
    if (!this.state.contentVisible) {
      return;
    }

    return (
      <div
        className="usa-banner__content usa-accordion__content"
        id="gov-banner"
      >
        <div className="grid-row grid-gap-lg">
          <div className="usa-banner__guidance tablet:grid-col-6">
            <img
              className="usa-banner__icon usa-media-block__img"
              src={iconDotGov}
              alt="Dot gov"
            />
            <div className="usa-media-block__body">
              <p>
                <strong>{i18n.t("banner.dotGov")}</strong>
                <br />
                {i18n.t("banner.dotGovHelper")}
              </p>
            </div>
          </div>
          <div className="usa-banner__guidance tablet:grid-col-6">
            <img
              className="usa-banner__icon usa-media-block__img"
              src={iconHttps}
              alt="Https"
            />
            <div className="usa-media-block__body">
              <p>
                <strong>{i18n.t("banner.secure")}</strong>
                <br />
                <Trans
                  i18nKey="banner.secureHelper"
                  components={[<strong>https://</strong>]}
                />
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  render() {
    return (
      <div className="usa-banner">
        <div className="usa-accordion">
          <header className="usa-banner__header">
            <div className="usa-banner__inner">
              <div className="grid-col-auto">
                <img
                  className="usa-banner__header-flag"
                  src={usFlagSmall}
                  alt="U.S. flag"
                />
              </div>
              <div className="grid-col-fill tablet:grid-col-auto">
                <p className="usa-banner__header-text">
                  {i18n.t("banner.officialWebsite")}
                </p>
                <p className="usa-banner__header-action" aria-hidden="true">
                  {i18n.t("banner.howYouKnow")}
                </p>
              </div>
              <button
                className="usa-accordion__button usa-banner__button"
                aria-expanded={this.state.contentVisible}
                aria-controls="gov-banner"
                onClick={this.toggleDetails.bind(this)}
              >
                <span className="usa-banner__button-text">
                  {i18n.t("banner.howYouKnow")}
                </span>
              </button>
            </div>
          </header>
          {this.renderAccordionContent()}
        </div>
      </div>
    );
  }
}
