import React from "react";
import usdsLogo from "../../img/usds-logo.png";
import Button from "../commonComponents/Button";

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
              <Button
                label="reset local storage"
                onClick={() => localStorage.clear()}
                secondary
              />
            </div>
          </div>
        </div>
      </footer>
    );
  }
}

export default Footer;
