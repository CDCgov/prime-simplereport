import React from "react";

import { stateCodes } from "../../../../config/constants";
import { requiresOrderProvider } from "../../../utils/state";
import Dropdown from "../../../commonComponents/Dropdown";
import TextInput from "../../../commonComponents/TextInput";
import { phoneNumberIsValid } from "../../../patients/personSchema";
import { FacilityFormData } from "../FacilityForm";
import { zipCodeRegex } from "../../../utils/address";

interface Props {
  newOrg?: boolean;
  errors: any;
  register: any;
  formCurrentValues: FacilityFormData;
}

const OrderingProvider: React.FC<Props> = ({
  newOrg = false,
  errors,
  register,
  formCurrentValues,
}) => {
  const isRequired = requiresOrderProvider(
    formCurrentValues.facility.state || ""
  );

  const isValidNPI = (npi: string) => {
    return /^\d{10}$/.test(npi);
  };

  return (
    <fieldset className="prime-container card-container usa-fieldset">
      <div className="usa-card__header">
        <legend>
          <h2 className="font-heading-lg">Ordering provider</h2>
        </legend>
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
          value={formCurrentValues.orderingProvider.firstName ?? undefined}
          validationStatus={
            errors?.orderingProvider?.firstName?.type ? "error" : undefined
          }
          errorMessage={errors?.orderingProvider?.firstName?.message}
          registrationProps={register("orderingProvider.firstName", {
            required: isRequired
              ? "Ordering provider first name is required"
              : "",
          })}
        />
        <TextInput
          label="Middle name"
          name="middleName"
          value={formCurrentValues.orderingProvider.middleName ?? undefined}
          registrationProps={register("orderingProvider.middleName", {
            required: false,
          })}
        />
        <TextInput
          label="Last name"
          name="lastName"
          required={isRequired}
          value={formCurrentValues.orderingProvider.lastName ?? undefined}
          validationStatus={
            errors?.orderingProvider?.lastName?.type ? "error" : undefined
          }
          errorMessage={errors?.orderingProvider?.lastName?.message}
          registrationProps={register("orderingProvider.lastName", {
            required: isRequired
              ? "Ordering provider last name is required"
              : "",
          })}
        />
        <TextInput
          label="Suffix"
          name="suffix"
          value={formCurrentValues.orderingProvider.suffix ?? undefined}
          registrationProps={register("orderingProvider.suffix", {
            required: false,
          })}
        />
        <TextInput
          label="National Provider Identifier (NPI)"
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
          value={formCurrentValues.orderingProvider.NPI ?? undefined}
          registrationProps={register("orderingProvider.NPI", {
            required: isRequired
              ? "NPI should be a 10-digit numerical value (##########)"
              : "",
            validate: {
              validNPI: (npi: string) =>
                npi?.length
                  ? isValidNPI(npi) ||
                    "NPI should be a 10-digit numerical value (##########)"
                  : true,
            },
          })}
          validationStatus={
            errors?.orderingProvider?.NPI?.type ? "error" : undefined
          }
          errorMessage={errors?.orderingProvider?.NPI?.message}
        />
        <TextInput
          label="Phone number"
          name="op-phone"
          required={isRequired}
          value={formCurrentValues.orderingProvider.phone ?? undefined}
          validationStatus={
            errors?.orderingProvider?.phone?.type ? "error" : undefined
          }
          errorMessage={errors?.orderingProvider?.phone?.message}
          registrationProps={register("orderingProvider.phone", {
            required: isRequired ? "Ordering provider phone is required" : "",
            validate: {
              validPhone: (opPhone: string) =>
                opPhone?.length
                  ? phoneNumberIsValid(opPhone) ||
                    "Ordering provider phone number is invalid"
                  : true,
            },
          })}
        />
        <TextInput
          label="Street address 1"
          name="op-street"
          value={formCurrentValues.orderingProvider.street ?? undefined}
          registrationProps={register("orderingProvider.street", {
            required: false,
          })}
        />
        <TextInput
          label="Street address 2"
          name="op-streetTwo"
          value={formCurrentValues.orderingProvider.streetTwo ?? undefined}
          registrationProps={register("orderingProvider.streetTwo", {
            required: false,
          })}
        />
        <TextInput
          label="City"
          name="op-city"
          value={formCurrentValues.orderingProvider.city ?? undefined}
          registrationProps={register("orderingProvider.city", {
            required: false,
          })}
        />
        <TextInput
          label="ZIP code"
          name="op-zipCode"
          value={formCurrentValues.orderingProvider.zipCode ?? undefined}
          validationStatus={
            errors?.orderingProvider?.zipCode?.type ? "error" : undefined
          }
          errorMessage={errors?.orderingProvider?.zipCode?.message}
          registrationProps={register("orderingProvider.zipCode", {
            required: false,
            validate: {
              validZip: (zipCode: string) =>
                zipCode?.length
                  ? zipCodeRegex.test(zipCode) ||
                    "Ordering provider ZIP code is invalid"
                  : true,
            },
          })}
          className="usa-input--medium"
        />
        <Dropdown
          label="State"
          name="op-state"
          selectedValue={formCurrentValues.orderingProvider.state}
          value={formCurrentValues.orderingProvider.state}
          registrationProps={register("orderingProvider.state", {
            required: false,
          })}
          onChange={() => {}}
          options={stateCodes.map((c) => ({ label: c, value: c }))}
          defaultSelect
          className="usa-input--medium"
        />
      </div>
    </fieldset>
  );
};

export default OrderingProvider;
