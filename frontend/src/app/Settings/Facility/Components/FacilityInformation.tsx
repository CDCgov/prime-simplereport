import React, { useCallback, useState } from "react";

import { stateCodes } from "../../../../config/constants";
import Dropdown from "../../../commonComponents/Dropdown";
import TextInput from "../../../commonComponents/TextInput";
import { facilitySchema, RequiredFacilityFields } from "../facilitySchema";

interface Props {
  facility: Facility;
  updateFacility: (facility: Facility) => void;
}

const FacilityInformation: React.FC<Props> = ({ facility, updateFacility }) => {
  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    updateFacility({ ...facility, [e.target.name]: e.target.value });
  };

  const [errors, setErrors] = useState<
    Partial<Record<keyof RequiredFacilityFields, string | undefined>>
  >({});

  const clearError = (field: keyof RequiredFacilityFields) => {
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  const validateField = useCallback(
    async (field: keyof RequiredFacilityFields) => {
      try {
        await facilitySchema.validateAt(field, facility);
      } catch (e) {
        setErrors((errors) => ({ ...errors, [field]: e.message }));
      }
    },
    [facility]
  );

  return (
    <div>
      <h2 style={{ margin: 0 }}>Facility information</h2>
      <div className="grid-row grid-gap">
        <div className="tablet:grid-col">
          <TextInput
            label="Testing facility name"
            name="name"
            value={facility.name}
            required
            onChange={(e) => {
              clearError("name");
              onChange(e);
            }}
            onBlur={() => {
              validateField("name");
            }}
            validationStatus={errors.name ? "error" : undefined}
            errorMessage={errors.name}
          />
        </div>
        <div className="tablet:grid-col">
          <TextInput
            label="CLIA number"
            name="cliaNumber"
            value={facility.cliaNumber}
            required
            onChange={(e) => {
              clearError("cliaNumber");
              onChange(e);
            }}
            onBlur={() => {
              validateField("cliaNumber");
            }}
            validationStatus={errors.cliaNumber ? "error" : undefined}
            errorMessage={errors.cliaNumber}
          />
        </div>
      </div>
      <div className="grid-row grid-gap">
        <div className="tablet:grid-col">
          <TextInput
            label="Phone number"
            name="phone"
            value={facility.phone}
            required
            onChange={(e) => {
              clearError("phone");
              onChange(e);
            }}
            onBlur={() => {
              validateField("phone");
            }}
            validationStatus={errors.phone ? "error" : undefined}
            errorMessage={errors.phone}
          />
        </div>
        <div className="tablet:grid-col">
          <TextInput
            label="Email"
            name="email"
            value={facility.email}
            onChange={onChange}
          />
        </div>
      </div>
      <div className="grid-row grid-gap">
        <div className="tablet:grid-col">
          <TextInput
            label="Street address 1"
            name="street"
            value={facility.street}
            required
            onChange={(e) => {
              clearError("street");
              onChange(e);
            }}
            onBlur={() => {
              validateField("street");
            }}
            validationStatus={errors.street ? "error" : undefined}
            errorMessage={errors.street}
          />
        </div>
      </div>
      <div className="grid-row grid-gap">
        <div className="tablet:grid-col">
          <TextInput
            label="Street address 2"
            name="streetTwo"
            value={facility.streetTwo}
            onChange={onChange}
          />
        </div>
      </div>
      <div className="grid-row grid-gap">
        <div className="tablet:grid-col">
          <TextInput
            label="City"
            name="city"
            value={facility.city}
            onChange={onChange}
          />
        </div>
        <div className="tablet:grid-col">
          <TextInput
            label="Zip code"
            name="zipCode"
            value={facility.zipCode}
            required
            onChange={(e) => {
              clearError("zipCode");
              onChange(e);
            }}
            onBlur={() => {
              validateField("zipCode");
            }}
            validationStatus={errors.zipCode ? "error" : undefined}
            errorMessage={errors.zipCode}
          />
        </div>
        <div className="tablet:grid-col">
          <Dropdown
            label="State"
            name="state"
            selectedValue={facility.state}
            options={stateCodes.map((c) => ({ label: c, value: c }))}
            defaultSelect
            className="sr-width-sm"
            required
            onChange={(e) => {
              clearError("state");
              onChange(e);
            }}
            onBlur={() => {
              validateField("state");
            }}
            validationStatus={errors.state ? "error" : undefined}
            errorMessage={errors.state}
          />
        </div>
      </div>
    </div>
  );
};

export default FacilityInformation;
