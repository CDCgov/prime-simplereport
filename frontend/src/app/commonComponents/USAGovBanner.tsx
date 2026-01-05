import React from "react";
import { Trans, withTranslation } from "react-i18next";

import i18n from "../../i18n";
import iconDotGov from "../../../node_modules/@uswds/uswds/dist/img/icon-dot-gov.svg";
import usFlagSmall from "../../../node_modules/@uswds/uswds/dist/img/us_flag_small.png";
import iconHttps from "../../../node_modules/@uswds/uswds/dist/img/icon-https.svg";

import "./USAGovBanner.scss";

interface Props {}

interface State {
  contentVisible: boolean;
}

class USAGovBanner extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
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
                  components={[<strong key="help-url-prefix">https://</strong>]}
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
      <div className="usa-banner usa-banner__header legacy-usa-banner">
        <div className="usa-accordion">
          <div className="usa-banner__inner">
            <div className="grid-col-auto">
              <img
                className="usa-banner__header-flag"
                src={usFlagSmall}
                alt=""
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
              aria-label={"Here's how you know this is an official website"}
              type="button"
              onClick={this.toggleDetails.bind(this)}
            >
              <span className="usa-banner__button-text" aria-hidden={true}>
                {i18n.t("banner.howYouKnow")}
              </span>
            </button>
          </div>
          {this.renderAccordionContent()}
        </div>
      </div>
    );
  }
}

export default withTranslation()(USAGovBanner);
