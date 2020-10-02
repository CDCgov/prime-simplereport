import React from "react";
import Button from "../../commonComponents/Button";
import TextInput from "../../commonComponents/TextInput";

class TestRegistrationManagementNav extends React.Component {
  render() {
    return (
      <header className="usa-banner__header prime-patient-nav">
        <div className="usa-banner__inner">
          <ul className="usa-button-group">
            <li className="usa-button-group__item">
              <form role="search">
                <TextInput
                  placeholder="Find Patient"
                  value={null}
                  onChange={() => {}}
                  name="patient-search"
                  addClass="usa-input"
                />
                <Button type="submit" onClick={() => {}} icon="search" />
              </form>
            </li>

            <li className="usa-button-group__item">
              <Button
                type="button"
                onClick={() => {}}
                outline={true}
                label="New Patient"
              />
            </li>
            <li className="usa-button-group__item">
              <Button
                type="button"
                onClick={() => {}}
                outline={true}
                label="CSV Upload"
              />
            </li>
          </ul>
        </div>
      </header>
    );
  }
}

export default TestRegistrationManagementNav;
