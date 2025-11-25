import React from "react";

import {
  liveJurisdictions,
  stateCodes,
  urls,
} from "../../../../config/constants";
import TextInput from "../../../commonComponents/TextInput";
import Dropdown from "../../../commonComponents/Dropdown";
import {
  isValidCLIANumber,
  stateRequiresCLIANumberValidation,
} from "../../../utils/clia";
import { getStateNameFromCode } from "../../../utils/state";
import { emailRegex } from "../../../utils/email";
import { phoneNumberIsValid } from "../../../patients/personSchema";
import { FacilityFormData } from "../FacilityForm";
import { zipCodeRegex } from "../../../utils/address";
import { facilityInfoErrMsgs } from "../constants";

interface Props {
  facility: Facility;
  setError: any;
  newOrg?: boolean;
  errors: any;
  register: any;
  formCurrentValues: FacilityFormData;
  getFieldState: any;
}

const FacilityInformation: React.FC<Props> = ({
  newOrg = false,
  errors,
  register,
  formCurrentValues,
  getFieldState,
}) => {
  const fieldState = getFieldState("facility.state");
  const isLiveState = (state: string) => {
    return liveJurisdictions.includes(state) && stateCodes.includes(state);
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
      <fieldset className="usa-fieldset">
        <legend>
          <h2 style={{ margin: 0 }}>Testing facility information</h2>
        </legend>
        <TextInput
          label="Testing facility name"
          name="name"
          value={formCurrentValues.facility?.name}
          required
          registrationProps={register("facility.name", {
            required: facilityInfoErrMsgs.name.required,
          })}
          validationStatus={errors?.facility?.name?.type ? "error" : undefined}
          errorMessage={errors?.facility?.name?.message}
        />
        <TextInput
          label="Phone number"
          name="facility-phone"
          value={formCurrentValues.facility?.phone}
          required
          registrationProps={register("facility.phone", {
            required: facilityInfoErrMsgs.phone.required,
            validate: {
              valid: (facPhone: string) =>
                phoneNumberIsValid(facPhone) ||
                facilityInfoErrMsgs.phone.invalid,
            },
          })}
          validationStatus={errors?.facility?.phone?.type ? "error" : undefined}
          errorMessage={errors?.facility?.phone?.message}
        />
        <TextInput
          label="Email"
          name="email"
          data-testid="facility-email"
          value={formCurrentValues.facility?.email ?? undefined}
          validationStatus={errors?.facility?.email?.type ? "error" : undefined}
          errorMessage={errors?.facility?.email?.message}
          registrationProps={register("facility.email", {
            pattern: {
              value: emailRegex,
              message: facilityInfoErrMsgs.email.invalid,
            },
          })}
        />
        <TextInput
          label="Street address 1"
          name="facility-street"
          value={formCurrentValues.facility?.street}
          required
          validationStatus={
            errors?.facility?.street?.type ? "error" : undefined
          }
          errorMessage={errors?.facility?.street?.message}
          registrationProps={register("facility.street", {
            required: facilityInfoErrMsgs.street.required,
          })}
        />
        <TextInput
          label="Street address 2"
          name="facility-streetTwo"
          value={formCurrentValues.facility?.streetTwo ?? undefined}
          registrationProps={register("facility.streetTwo")}
        />
        <TextInput
          label="City"
          name="facility-city"
          value={formCurrentValues.facility?.city ?? undefined}
          registrationProps={register("facility.city")}
        />
        <TextInput
          label="ZIP code"
          name="facility-zipCode"
          value={formCurrentValues.facility?.zipCode}
          required
          validationStatus={
            errors?.facility?.zipCode?.type ? "error" : undefined
          }
          errorMessage={errors?.facility?.zipCode?.message}
          registrationProps={register("facility.zipCode", {
            required: facilityInfoErrMsgs.zip.required,
            pattern: {
              value: zipCodeRegex,
              message: facilityInfoErrMsgs.zip.invalid,
            },
          })}
          className="usa-input--medium"
        />
        <Dropdown
          label="State"
          name="facility-state"
          selectedValue={formCurrentValues.facility?.state}
          options={stateCodes.map((c) => ({ label: c, value: c }))}
          defaultSelect
          required
          hintText={
            fieldState?.error && (
              <span className="display-block margin-top-05 usa-error-message">
                See a{" "}
                <a href={urls.FACILITY_INFO}>
                  {" "}
                  list of states where SimpleReport is supported
                </a>
                .
              </span>
            )
          }
          validationStatus={errors?.facility?.state?.type ? "error" : undefined}
          errorMessage={errors?.facility?.state?.message}
          selectClassName="usa-input--medium"
          data-testid="facility-state-dropdown"
          registrationProps={register("facility.state", {
            required: facilityInfoErrMsgs.state.required,
            validate: {
              liveJurisdiction: (state: string) =>
                isLiveState(state) ||
                `${facilityInfoErrMsgs.state.invalid} ${getStateNameFromCode(
                  state
                )}.`,
            },
          })}
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
          value={formCurrentValues.facility?.cliaNumber}
          required
          validationStatus={
            errors?.facility?.cliaNumber?.type ? "error" : undefined
          }
          errorMessage={errors?.facility?.cliaNumber?.message}
          registrationProps={register("facility.cliaNumber", {
            required: facilityInfoErrMsgs.clia.required,
            validate: {
              validCLIA: (clia: string) =>
                (stateRequiresCLIANumberValidation(
                  formCurrentValues.facility.state
                )
                  ? isValidCLIANumber(clia, formCurrentValues.facility.state)
                  : true) || facilityInfoErrMsgs.clia.invalid,
            },
          })}
        />
      </fieldset>
    </div>
  );
};

export default FacilityInformation;
