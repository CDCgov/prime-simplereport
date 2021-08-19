import React from "react";

import { stateCodes } from "../../../../config/constants";
import Dropdown from "../../../commonComponents/Dropdown";
import TextInput from "../../../commonComponents/TextInput";
import { FacilityErrors } from "../facilitySchema";
import { ValidateField } from "../FacilityForm";

interface Props {
  facility: Facility;
  updateFacility: (facility: Facility) => void;
  errors: FacilityErrors;
  validateField: ValidateField;
}

const FacilityInformation: React.FC<Props> = ({
  facility,
  updateFacility,
  errors,
  validateField,
}) => {
  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    updateFacility({ ...facility, [e.target.name]: e.target.value });
  };

  return (
    <div className="usa-form usa-form--large">
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
        label="CLIA number"
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
      <TextInput
        label="Phone number"
        name="phone"
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
        name="street"
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
        name="streetTwo"
        value={facility.streetTwo || ""}
        onChange={onChange}
      />
      <TextInput
        label="City"
        name="city"
        value={facility.city || ""}
        onChange={onChange}
      />
      <TextInput
        label="ZIP code"
        name="zipCode"
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
        name="state"
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
    </div>
  );
};

export default FacilityInformation;
