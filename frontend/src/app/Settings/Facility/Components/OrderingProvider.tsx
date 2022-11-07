import React from "react";

import { stateCodes } from "../../../../config/constants";
import { requiresOrderProvider } from "../../../utils/state";
import { ValidateField } from "../FacilityForm";
import { FacilityErrors } from "../facilitySchema";
import Dropdown from "../../../commonComponents/Dropdown";
import TextInput from "../../../commonComponents/TextInput";
import { getSubStrAfterChar } from "../../../utils/text";

interface Props {
  facility: Facility;
  updateProvider: (provider: Provider) => void;
  errors: FacilityErrors;
  validateField: ValidateField;
  newOrg?: boolean;
}

const OrderingProvider: React.FC<Props> = ({
  facility,
  updateProvider,
  errors,
  validateField,
  newOrg = false,
}) => {
  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    let fieldName = getSubStrAfterChar(e.target.name, "-");
    updateProvider({ ...provider, [fieldName]: e.target.value });
  };

  const { orderingProvider: provider } = facility;
  const isRequired = requiresOrderProvider(facility.state || "");

  return (
    <div className="prime-container card-container">
      <div className="usa-card__header">
        <h2 className="font-heading-lg">Ordering provider</h2>
      </div>
      <div className="usa-form usa-form--large usa-card__body">
        {newOrg && (
          <>
            <p>
              Please enter one ordering provider to get started. If you need to,
              you can add more after account setup.
            </p>
            <p>
              If you plan to upload your results in bulk, you can include
              additional ordering providers in your spreadsheets without adding
              them to SimpleReport.
            </p>
          </>
        )}
        <TextInput
          label="First name"
          name="firstName"
          required={isRequired}
          value={provider.firstName || ""}
          onChange={onChange}
          onBlur={() => {
            validateField("orderingProvider.firstName");
          }}
          validationStatus={
            errors["orderingProvider.firstName"] ? "error" : undefined
          }
          errorMessage={errors["orderingProvider.firstName"]}
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
          onBlur={() => {
            validateField("orderingProvider.lastName");
          }}
          validationStatus={
            errors["orderingProvider.lastName"] ? "error" : undefined
          }
          errorMessage={errors["orderingProvider.lastName"]}
        />
        <TextInput
          label="Suffix"
          name="suffix"
          value={provider.suffix || ""}
          onChange={onChange}
        />
        <TextInput
          label="NPI"
          hintText={
            <a
              href="https://npiregistry.cms.hhs.gov/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Find my NPI
            </a>
          }
          name="NPI"
          required={isRequired}
          value={provider.NPI || ""}
          onChange={onChange}
          onBlur={() => {
            validateField("orderingProvider.NPI");
          }}
          validationStatus={
            errors["orderingProvider.NPI"] ? "error" : undefined
          }
          errorMessage={errors["orderingProvider.NPI"]}
        />
        <TextInput
          label="Phone number"
          name="op-phone"
          required={isRequired}
          value={provider.phone || ""}
          onChange={onChange}
          onBlur={() => {
            validateField("orderingProvider.phone");
          }}
          validationStatus={
            errors["orderingProvider.phone"] ? "error" : undefined
          }
          errorMessage={errors["orderingProvider.phone"]}
        />
        <TextInput
          label="Street address 1"
          name="op-street"
          value={provider.street || ""}
          onChange={onChange}
        />
        <TextInput
          label="Street address 2"
          name="op-streetTwo"
          value={provider.streetTwo || ""}
          onChange={onChange}
        />
        <TextInput
          label="City"
          name="op-city"
          value={provider.city || ""}
          onChange={onChange}
        />
        <TextInput
          label="ZIP code"
          name="op-zipCode"
          value={provider.zipCode || ""}
          onChange={onChange}
          className="usa-input--medium"
        />
        <Dropdown
          label="State"
          name="op-state"
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
