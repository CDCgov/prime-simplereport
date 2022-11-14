import React from "react";

import { stateCodes } from "../../../../config/constants";
import Dropdown from "../../../commonComponents/Dropdown";
import TextInput from "../../../commonComponents/TextInput";
import { FacilityErrors } from "../facilitySchema";
import { ValidateField } from "../FacilityForm";
import { getSubStrAfterChar } from "../../../utils/text";

interface Props {
  facility: Facility;
  updateFacility: (facility: Facility) => void;
  errors: FacilityErrors;
  validateField: ValidateField;
  newOrg?: boolean;
}

const FacilityInformation: React.FC<Props> = ({
  facility,
  updateFacility,
  errors,
  validateField,
  newOrg = false,
}) => {
  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    let fieldName = getSubStrAfterChar(e.target.name, "-");
    updateFacility({ ...facility, [fieldName]: e.target.value });
  };

  return (
    <div className="usa-form usa-form--large">
      {newOrg && (
        <>
          <p>
            Please enter one facility to get started. You can add more after
            account setup.
          </p>
          <p>
            If you plan to upload your results in bulk, you can include
            additional facilities in your spreadsheets without adding them in
            SimpleReport.
          </p>
        </>
      )}
      <h2 className="font-heading-lg" style={{ margin: 0 }}>
        Testing facility information
      </h2>
      <TextInput
        label="Testing facility name"
        name="name"
        value={facility.name}
        required
        onChange={onChange}
        onBlur={() => {
          validateField("name");
        }}
        validationStatus={errors.name ? "error" : undefined}
        errorMessage={errors.name}
      />
      <TextInput
        label="Phone number"
        name="facility-phone"
        value={facility.phone}
        required
        onChange={onChange}
        onBlur={() => {
          validateField("phone");
        }}
        validationStatus={errors.phone ? "error" : undefined}
        errorMessage={errors.phone}
      />
      <TextInput
        label="Email"
        name="email"
        data-testid="facility-email"
        value={facility.email || ""}
        onChange={onChange}
        onBlur={() => {
          validateField("email");
        }}
        validationStatus={errors.email ? "error" : undefined}
        errorMessage={errors.email}
      />
      <TextInput
        label="Street address 1"
        name="facility-street"
        value={facility.street}
        required
        onChange={onChange}
        onBlur={() => {
          validateField("street");
        }}
        validationStatus={errors.street ? "error" : undefined}
        errorMessage={errors.street}
      />
      <TextInput
        label="Street address 2"
        name="facility-streetTwo"
        value={facility.streetTwo || ""}
        onChange={onChange}
      />
      <TextInput
        label="City"
        name="facility-city"
        value={facility.city || ""}
        onChange={onChange}
      />
      <TextInput
        label="ZIP code"
        name="facility-zipCode"
        value={facility.zipCode}
        required
        onChange={onChange}
        onBlur={() => {
          validateField("zipCode");
        }}
        validationStatus={errors.zipCode ? "error" : undefined}
        errorMessage={errors.zipCode}
        className="usa-input--medium"
      />
      <Dropdown
        label="State"
        name="facility-state"
        selectedValue={facility.state}
        options={stateCodes.map((c) => ({ label: c, value: c }))}
        defaultSelect
        required
        onChange={onChange}
        onBlur={() => {
          validateField("state");
        }}
        validationStatus={errors.state ? "error" : undefined}
        errorMessage={errors.state}
        selectClassName="usa-input--medium"
        data-testid="facility-state-dropdown"
      />
      <TextInput
        label="CLIA number"
        hintText={
          <a
            href="https://www.cdc.gov/clia/LabSearch.html#"
            target="_blank"
            rel="noopener noreferrer"
          >
            Find my CLIA
          </a>
        }
        name="cliaNumber"
        value={facility.cliaNumber}
        required
        onChange={onChange}
        onBlur={() => {
          validateField("cliaNumber");
        }}
        validationStatus={errors.cliaNumber ? "error" : undefined}
        errorMessage={errors.cliaNumber}
      />
    </div>
  );
};

export default FacilityInformation;
