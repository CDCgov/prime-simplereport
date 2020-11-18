import React from "react";
import TextInput from "../commonComponents/TextInput";

const OrderingProviderSettings = ({ orgSettings, updateOrgSettings }) => {
  const onInputChange = (e) => {
    let name = e.target.name;
    let value = e.target.value;
    let newOrgSettings = {
      ...orgSettings,
      [name]: value,
    };
    updateOrgSettings(newOrgSettings);
  };

  let {
    orderingProviderName,
    orderingProviderNPI,
    orderingProviderStreet,
    orderingProviderStreetTwo,
    orderingProviderCity,
    orderingProviderCounty,
    orderingProviderZipCode,
    orderingProviderState,
    orderingProviderPhone,
  } = {
    ...orgSettings,
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
                  value={orderingProviderName || ""}
                  onChange={onInputChange}
                  name={"orderingProviderName"}
                />
              </div>
              <div className="tablet:grid-col">
                <TextInput
                  label={"NPI"}
                  value={orderingProviderNPI || ""}
                  onChange={onInputChange}
                  name={"orderingProviderNPI"}
                />
              </div>
              <div className="tablet:grid-col">
                <TextInput
                  label={"Street 1"}
                  value={orderingProviderStreet || ""}
                  onChange={onInputChange}
                  name={"orderingProviderStreet"}
                />
              </div>
              <div className="tablet:grid-col">
                <TextInput
                  label={"Street 2"}
                  value={orderingProviderStreetTwo || ""}
                  onChange={onInputChange}
                  name={"orderingProviderStreetTwo"}
                />
              </div>
              <div className="tablet:grid-col">
                <TextInput
                  label={"City"}
                  value={orderingProviderCity || ""}
                  onChange={onInputChange}
                  name={"orderingProviderCity"}
                />
              </div>
            </div>
            <div className="grid-row grid-gap">
              <div className="tablet:grid-col">
                <TextInput
                  label={"County"}
                  value={orderingProviderCounty || ""}
                  onChange={onInputChange}
                  name={"orderingProviderCounty"}
                />
              </div>
              <div className="tablet:grid-col">
                <TextInput
                  label={"Zip Code"}
                  value={orderingProviderZipCode || ""}
                  onChange={onInputChange}
                  name={"orderingProviderZipCode"}
                />
              </div>
              <div className="tablet:grid-col">
                <TextInput
                  label={"State"}
                  value={orderingProviderState || ""}
                  onChange={onInputChange}
                  name={"orderingProviderState"}
                />
              </div>
              <div className="tablet:grid-col">
                <TextInput
                  label={"Phone Number"}
                  value={orderingProviderPhone || ""}
                  onChange={onInputChange}
                  name={"orderingProviderPhone"}
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
