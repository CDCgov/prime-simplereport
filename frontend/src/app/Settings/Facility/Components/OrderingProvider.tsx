import React from "react";

import { stateCodes } from "../../../../config/constants";
import Dropdown from "../../../commonComponents/Dropdown";
import TextInput from "../../../commonComponents/TextInput";
import { FacilityErrors } from "../facilitySchema";
import { ValidateField } from "../FacilityForm";

interface Props {
  provider: Provider;
  updateProvider: (provider: Provider) => void;
  errors: FacilityErrors;
  validateField: ValidateField;
}

const OrderingProvider: React.FC<Props> = ({
  provider,
  updateProvider,
  errors,
  validateField,
}) => {
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
              onBlur={() => {
                validateField("orderingProvider.firstName");
              }}
              validationStatus={
                errors["orderingProvider.firstName"] ? "error" : undefined
              }
              errorMessage={errors["orderingProvider.firstName"]}
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
              onBlur={() => {
                validateField("orderingProvider.lastName");
              }}
              validationStatus={
                errors["orderingProvider.lastName"] ? "error" : undefined
              }
              errorMessage={errors["orderingProvider.lastName"]}
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
              onBlur={() => {
                validateField("orderingProvider.NPI");
              }}
              validationStatus={
                errors["orderingProvider.NPI"] ? "error" : undefined
              }
              errorMessage={errors["orderingProvider.NPI"]}
              required
            />
          </div>
          <div className="tablet:grid-col">
            <TextInput
              label="Phone number"
              name="phone"
              value={provider.phone}
              onChange={onChange}
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
              onBlur={() => {
                validateField("orderingProvider.street");
              }}
              validationStatus={
                errors["orderingProvider.street"] ? "error" : undefined
              }
              errorMessage={errors["orderingProvider.street"]}
              required
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
              label="Zip code"
              name="zipCode"
              value={provider.zipCode}
              onChange={onChange}
              onBlur={() => {
                validateField("orderingProvider.zipCode");
              }}
              validationStatus={
                errors["orderingProvider.zipCode"] ? "error" : undefined
              }
              errorMessage={errors["orderingProvider.zipCode"]}
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
              onBlur={() => {
                validateField("orderingProvider.state");
              }}
              validationStatus={
                errors["orderingProvider.state"] ? "error" : undefined
              }
              errorMessage={errors["orderingProvider.state"]}
              required
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderingProvider;
