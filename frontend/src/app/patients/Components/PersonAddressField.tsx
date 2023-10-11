import React from "react";
import { Checkbox } from "@trussworks/react-uswds";
import { useTranslation } from "react-i18next";

import Select from "../../commonComponents/Select";
import {
  canadianProvinceCodes,
  countryOptions,
  stateCodes,
} from "../../../config/constants";
import Input from "../../commonComponents/Input";
import { PersonErrors } from "../personSchema";

import { PersonFormView } from "./PersonForm";

interface PersonAddressFieldProps {
  view: PersonFormView;
  formObject: Nullable<PersonFormData>;
  onChange: <K extends keyof PersonFormData>(
    field: K
  ) => (value: PersonFormData[K]) => void;
  validate: (field: keyof PersonErrors) => Promise<void>;
  getValidationStatus: (name: keyof PersonFormData) => "error" | undefined;
  errors: Partial<Record<keyof PersonFormData, string>>;
}

const PersonAddressField: React.FC<PersonAddressFieldProps> = (
  addressFieldProps
) => {
  const { t } = useTranslation();
  const { view, ...commonInputProps } = addressFieldProps;
  const {
    formObject: patient,
    onChange: onPersonChange,
    validate: onBlurField,
    errors,
    getValidationStatus,
  } = commonInputProps;

  return (
    <>
      <Checkbox
        id={"unknownAddress"}
        name={"unknownAddress"}
        label={t("patient.form.contact.unknownAddress")}
        checked={patient.unknownAddress ?? undefined}
        onChange={(e) => {
          onPersonChange("unknownAddress")(e.target.checked);
        }}
      />
      {!patient.unknownAddress && (
        <div>
          <div className="usa-form">
            <Select
              label={t("patient.form.contact.country")}
              name="country"
              value={patient.country || "USA"}
              options={countryOptions}
              onChange={onPersonChange("country")}
              onBlur={() => {
                onBlurField("country");
              }}
              validationStatus={getValidationStatus("country")}
              errorMessage={errors.country}
              required
            />
          </div>
          <div className="usa-form">
            <Input
              {...commonInputProps}
              field="street"
              label={t("patient.form.contact.street1")}
              required
            />
          </div>
          <div className="usa-form">
            <Input
              {...commonInputProps}
              field="streetTwo"
              label={t("patient.form.contact.street2")}
            />
          </div>
          <div className="usa-form">
            <Input
              {...commonInputProps}
              field="city"
              label={t("patient.form.contact.city")}
              required
            />
            {view !== PersonFormView.SELF_REGISTRATION && (
              <Input
                {...commonInputProps}
                field="county"
                label={t("patient.form.contact.county")}
              />
            )}
            {patient.country === "USA" ? (
              <div className="grid-row grid-gap">
                <div className="mobile-lg:grid-col-6">
                  <Select
                    label={t("patient.form.contact.state")}
                    name="state"
                    value={patient.state || ""}
                    options={stateCodes.map((c) => ({ label: c, value: c }))}
                    defaultOption={t("common.defaultDropdownOption")}
                    defaultSelect
                    onChange={onPersonChange("state")}
                    onBlur={() => {
                      onBlurField("state");
                    }}
                    validationStatus={errors.state ? "error" : undefined}
                    errorMessage={errors.state}
                    required
                  />
                </div>
                <div className="mobile-lg:grid-col-6">
                  <Input
                    {...commonInputProps}
                    field="zipCode"
                    label={t("patient.form.contact.zip")}
                    required
                  />
                </div>
              </div>
            ) : null}
            {patient.country === "CAN" ? (
              <div className="grid-row grid-gap">
                <div className="mobile-lg:grid-col-6">
                  <Select
                    label={t("patient.form.contact.state")}
                    name="state"
                    value={patient.state || ""}
                    options={canadianProvinceCodes.map((c) => ({
                      label: c,
                      value: c,
                    }))}
                    defaultOption={t("common.defaultDropdownOption")}
                    defaultSelect
                    onChange={onPersonChange("state")}
                    onBlur={() => {
                      onBlurField("state");
                    }}
                    validationStatus={errors.state ? "error" : undefined}
                    errorMessage={errors.state}
                    required
                  />
                </div>
                <div className="mobile-lg:grid-col-6">
                  <Input
                    {...commonInputProps}
                    field="zipCode"
                    label={t("patient.form.contact.zip")}
                    required
                  />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </>
  );
};

export default PersonAddressField;
