import React from "react";
import TextInput from "../commonComponents/TextInput";

const OrderingProviderSettings = ({ orgSettings, updateOrgSettings }) => {
  const onInputChange = (e) => {
    let name = e.target.name;
    let value = e.target.value;
    let newOrgSettings = {
      ...orgSettings,
      orderingProvider: {
        ...orgSettings.orderingProvider,
        [name]: value,
      },
    };
    updateOrgSettings(newOrgSettings);
  };

  let { name, npi, address, zip, phone } = {
    ...orgSettings.orderingProvider,
  };

  return (
    <div className="grid-container">
      <div className="grid-row">
        <div className="prime-container usa-card__container">
          <div className="usa-card__header">
            <h2> Ordering Provider </h2>
          </div>
          <div className="usa-card__body">
            <div className="grid-row grid-gap">
              <div className="tablet:grid-col">
                <TextInput
                  label={"Name"}
                  value={name || ""}
                  onChange={onInputChange}
                  name={"name"} // TODO: don't hardcode this.
                />
              </div>
              <div className="tablet:grid-col">
                <TextInput
                  label={"NPI"}
                  value={npi || ""}
                  onChange={onInputChange}
                  name={"npi"}
                />
              </div>
              <div className="tablet:grid-col">
                <TextInput
                  label={"Address"}
                  value={address || ""}
                  onChange={onInputChange}
                  name={"address"}
                />
              </div>
              <div className="tablet:grid-col">
                <TextInput
                  label={"Zip Code"}
                  value={zip || ""}
                  onChange={onInputChange}
                  name={"zip"}
                />
              </div>
              <div className="tablet:grid-col">
                <TextInput
                  label={"Phone Number"}
                  value={phone || ""}
                  onChange={onInputChange}
                  name={"phone"}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderingProviderSettings;
