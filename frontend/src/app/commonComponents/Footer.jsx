import React from "react";

import usdsLogo from "../../img/usds-logo.png";

class Footer extends React.Component {
  render() {
    return (
      <footer className="usa-footer usa-footer--slim">
        <div className="usa-footer__primary-section">
          <div className="grid-container">
            <div className="usa-footer__primary-container grid-row">
              <img
                className="usa-footer__logo-img"
                src={usdsLogo}
                alt="USDS logo"
              />
            </div>
          </div>
        </div>
      </footer>
    );
  }
}

export default Footer;
