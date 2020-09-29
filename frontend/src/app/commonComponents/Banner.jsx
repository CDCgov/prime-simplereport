import React from "react";
import iconDotGov from "../../img/icons/icon-dot-gov.svg";
import usFlagSmall from "../../img/icons/us_flag_small.png";
import iconHttps from "../../img/icons/icon-https.svg";

export default class Banner extends React.Component {
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
                <strong>The .gov means it’s official.</strong>
                <br />
                Federal government websites often end in .gov or .mil. Before
                sharing sensitive information, make sure you’re on a federal
                government site.
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
                <strong>The site is secure.</strong>
                <br />
                The <strong>https://</strong> ensures that you are connecting to
                the official website and that any information you provide is
                encrypted and transmitted securely.
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
                  An official website of the United States government
                </p>
                <p className="usa-banner__header-action" aria-hidden="true">
                  Here’s how you know
                </p>
              </div>
              <button
                className="usa-accordion__button usa-banner__button"
                aria-expanded={this.state.contentVisible}
                aria-controls="gov-banner"
                onClick={this.toggleDetails.bind(this)}
              >
                <span className="usa-banner__button-text">
                  Here’s how you know
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
