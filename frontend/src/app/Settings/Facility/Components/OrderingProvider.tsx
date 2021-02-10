import React from "react";
import { stateCodes } from "../../../../config/constants";
import Dropdown from "../../../commonComponents/Dropdown";
import TextInput from "../../../commonComponents/TextInput";

interface Props {
  provider: Provider;
  updateProvider: (provider: Provider) => void;
}

const OrderingProvider: React.FC<Props> = ({ provider, updateProvider }) => {
  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    updateProvider({ ...provider, [e.target.name]: e.target.value });
  };
  return (
    <div className="prime-container usa-card__container">
      <div className="usa-card__header">
        <h2>Ordering provider</h2>
      </div>
      <div className="usa-card__body">
        <div className="grid-row grid-gap">
          <div className="tablet:grid-col">
            <TextInput
              label="First name"
              name="firstName"
              value={provider.firstName}
              onChange={onChange}
              required
            />
          </div>
          <div className="tablet:grid-col">
            <TextInput
              label="Middle name"
              name="middleName"
              value={provider.middleName}
              onChange={onChange}
            />
          </div>
          <div className="tablet:grid-col">
            <TextInput
              label="Last name"
              name="lastName"
              value={provider.lastName}
              onChange={onChange}
              required
            />
          </div>
          <div className="tablet:grid-col">
            <TextInput
              label="Suffix"
              name="suffix"
              value={provider.suffix}
              onChange={onChange}
            />
          </div>
        </div>
        <div className="grid-row grid-gap">
          <div className="tablet:grid-col">
            <TextInput
              label="NPI"
              name="NPI"
              value={provider.NPI}
              onChange={onChange}
              required
            />
          </div>
          <div className="tablet:grid-col">
            <TextInput
              label="Phone number"
              name="phone"
              value={provider.phone}
              onChange={onChange}
              required
            />
          </div>
        </div>
        <div className="grid-row grid-gap">
          <div className="tablet:grid-col">
            <TextInput
              label="Street address 1"
              name="street"
              value={provider.street}
              onChange={onChange}
            />
          </div>
        </div>
        <div className="grid-row grid-gap">
          <div className="tablet:grid-col">
            <TextInput
              label="Street address 2"
              name="streetTwo"
              value={provider.streetTwo}
              onChange={onChange}
            />
          </div>
        </div>
        <div className="grid-row grid-gap">
          <div className="tablet:grid-col">
            <TextInput
              label="City"
              name="city"
              value={provider.city}
              onChange={onChange}
            />
          </div>
          <div className="tablet:grid-col">
            <TextInput
              label="County"
              name="county"
              value={provider.county}
              onChange={onChange}
            />
          </div>
          <div className="tablet:grid-col">
            <TextInput
              label="Zip code"
              name="zipCode"
              value={provider.zipCode}
              onChange={onChange}
              required
            />
          </div>
          <div className="tablet:grid-col">
            <Dropdown
              label="State"
              name="state"
              selectedValue={provider.state}
              options={stateCodes.map((c) => ({ label: c, value: c }))}
              defaultSelect
              className="sr-width-sm"
              onChange={onChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderingProvider;
