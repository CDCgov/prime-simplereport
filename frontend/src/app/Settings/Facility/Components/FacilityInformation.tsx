import React from "react";

import {
  stateCodes,
  liveJurisdictions,
  urls,
} from "../../../../config/constants";
import Dropdown from "../../../commonComponents/Dropdown";
import TextInput from "../../../commonComponents/TextInput";
import Alert from "../../../commonComponents/Alert";
import { getStateNameFromCode } from "../../../utils/state";
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
    <div>
      <h2 style={{ margin: 0 }}>Facility information</h2>
      <div className="grid-row grid-gap">
        <div className="tablet:grid-col">
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
        </div>
        <div className="tablet:grid-col">
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
        </div>
      </div>
      <div className="grid-row grid-gap">
        <div className="tablet:grid-col">
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
        </div>
        <div className="tablet:grid-col">
          <TextInput
            label="Email"
            name="email"
            value={facility.email || ""}
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
            onChange={onChange}
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
            value={facility.streetTwo || ""}
            onChange={onChange}
          />
        </div>
      </div>
      <div className="grid-row grid-gap">
        <div className="tablet:grid-col">
          <TextInput
            label="City"
            name="city"
            value={facility.city || ""}
            onChange={onChange}
          />
        </div>
        <div className="tablet:grid-col">
          <TextInput
            label="Zip code"
            name="zipCode"
            value={facility.zipCode}
            required
            onChange={onChange}
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
            onChange={onChange}
            onBlur={() => {
              validateField("state");
            }}
            validationStatus={errors.state ? "error" : undefined}
            errorMessage={errors.state}
          />
        </div>
      </div>
      {errors.state &&
        stateCodes.includes(facility.state) &&
        !liveJurisdictions.includes(facility.state) && (
          <div className="grid-row">
            <div className="grid-col-12">
              <Alert
                type="error"
                title={`SimpleReport is not currently supported in ${getStateNameFromCode(
                  facility.state
                )}`}
                body={
                  <div>
                    See a{" "}
                    <a href={urls.FACILITY_INFO}>
                      list of states where SimpleReport is supported
                    </a>
                  </div>
                }
              />
            </div>
          </div>
        )}
    </div>
  );
};

export default FacilityInformation;
