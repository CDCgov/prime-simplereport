import React from "react";

import { stateCodes } from "../../../../config/constants";
import { requiresOrderProvider } from "../../../utils/state"
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

  const isRequired = requiresOrderProvider(provider.state || "");

  return (
    <div className="prime-container card-container">
      <div className="usa-card__header">
        <h2 className="font-heading-lg">Ordering provider</h2>
      </div>
      <div className="usa-form usa-form--large usa-card__body">
        <TextInput
          label="First name"
          name="firstName"
          required={isRequired}
          value={provider.firstName || ""}
          onChange={onChange}
        />
        <TextInput
          label="Middle name"
          name="middleName"
          value={provider.middleName || ""}
          onChange={onChange}
        />
        <TextInput
          label="Last name"
          name="lastName"
          required={isRequired}
          value={provider.lastName || ""}
          onChange={onChange}
        />
        <TextInput
          label="Suffix"
          name="suffix"
          value={provider.suffix || ""}
          onChange={onChange}
        />
        <TextInput
          label="NPI"
          name="NPI"
          required={isRequired}
          value={provider.NPI || ""}
          onChange={onChange}
        />
        <TextInput
          label="Phone number"
          name="phone"
          required={isRequired}
          value={provider.phone || ""}
          onChange={onChange}
        />
        <TextInput
          label="Street address 1"
          name="street"
          value={provider.street || ""}
          onChange={onChange}
        />
        <TextInput
          label="Street address 2"
          name="streetTwo"
          value={provider.streetTwo || ""}
          onChange={onChange}
        />
        <TextInput
          label="City"
          name="city"
          value={provider.city || ""}
          onChange={onChange}
        />
        <TextInput
          label="Zip code"
          name="zipCode"
          value={provider.zipCode || ""}
          onChange={onChange}
          className="usa-input--medium"
        />
        <Dropdown
          label="State"
          name="state"
          selectedValue={provider.state || ""}
          options={stateCodes.map((c) => ({ label: c, value: c }))}
          defaultSelect
          className="usa-input--medium"
          onChange={onChange}
        />
      </div>
    </div>
  );
};

export default OrderingProvider;
