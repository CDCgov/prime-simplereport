import { useState } from "react";
import { toast } from "react-toastify";
import { DatePicker, Label } from "@trussworks/react-uswds";
import moment from "moment";

import { Card } from "../../commonComponents/Card/Card";
import { CardBackground } from "../../commonComponents/CardBackground/CardBackground";
import Button from "../../commonComponents/Button/Button";
import { showNotification } from "../../utils";
import Alert from "../../commonComponents/Alert";
import { isFormValid, isFieldValid } from "../../utils/yupHelpers";
import Input from "../../commonComponents/Input";
import { stateCodes } from "../../../config/constants";
import Select from "../../commonComponents/Select";

import {
  initPersonalDetails,
  initPersonalDetailsErrors,
  personalDetailsFields,
  personalDetailsSchema as schema,
} from "./utils";
import QuestionsFormContainer from "./QuestionsFormContainer";

type PersonalDetailsFormErrors = Record<
  keyof IdentityVerificationRequest,
  string
>;

const PersonalDetailsForm = () => {
  const [
    personalDetails,
    setPersonalDetails,
  ] = useState<IdentityVerificationRequest>(initPersonalDetails());
  const [errors, setErrors] = useState<PersonalDetailsFormErrors>(
    initPersonalDetailsErrors()
  );

  const [saving, setSaving] = useState(false);
  const [formChanged, setFormChanged] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const onDetailChange = (field: keyof IdentityVerificationRequest) => (
    value: IdentityVerificationRequest[typeof field]
  ) => {
    setFormChanged(true);
    setPersonalDetails({ ...personalDetails, [field]: value });
  };

  const validateField = async (field: keyof IdentityVerificationRequest) => {
    setErrors(
      await isFieldValid({ data: personalDetails, schema, errors, field })
    );
  };

  const getValidationStatus = (field: keyof IdentityVerificationRequest) =>
    errors[field] ? "error" : undefined;

  const onSave = async () => {
    setSaving(true);
    const validation = await isFormValid({
      data: personalDetails,
      schema,
    });
    if (validation.valid) {
      setErrors(initPersonalDetailsErrors());
      setSubmitted(true);
      return;
    }
    setErrors(validation.errors);
    const alert = (
      <Alert
        type="error"
        title="Form Errors"
        body="Please check the form to make sure you complete all of the required fields."
      />
    );
    showNotification(toast, alert);
    setSaving(false);
  };

  if (submitted) {
    return <QuestionsFormContainer personalDetails={personalDetails} />;
  }

  const getFormElement = (
    field: keyof IdentityVerificationRequest,
    label: string,
    required: boolean,
    preheader: string | null
  ) => {
    switch (field) {
      case "state":
        return (
          <Select
            label={label}
            name="state"
            value={personalDetails.state || ""}
            options={stateCodes.map((c) => ({ label: c, value: c }))}
            defaultSelect
            onChange={onDetailChange("state")}
            onBlur={() => {
              validateField("state");
            }}
            validationStatus={getValidationStatus("state")}
            errorMessage={errors.state}
            required
          />
        );
      case "dateOfBirth":
        const now = moment();
        return (
          <>
            <Label
              htmlFor="dateOfBirth"
              className="font-ui-sm text-bold margin-bottom-1"
            >
              Date of birth
            </Label>
            <span className="usa-hint">mm/dd/yyyy</span>
            <DatePicker
              id={field}
              name={field}
              onChange={(date) => {
                if (date) {
                  const newDate = moment(date)
                    .hour(now.hours())
                    .minute(now.minutes());
                  onDetailChange("dateOfBirth")(newDate.format("MM/DD/YYYY"));
                }
              }}
            />
          </>
        );
      default:
        return (
          <Input
            className={preheader ? "margin-top-0" : ""}
            label={label}
            type={"text"}
            field={field}
            key={field}
            formObject={personalDetails}
            onChange={onDetailChange}
            errors={errors}
            validate={validateField}
            getValidationStatus={getValidationStatus}
            required={required}
          />
        );
    }
  };

  return (
    <CardBackground>
      <Card logo bodyKicker="Enter personal details">
        <div className="margin-bottom-2">
          <p className="font-ui-2xs text-base">
            To create your account, you’ll need to reenter information and
            answer a few questions to verify your identity directly with
            Experian. SimpleReport doesn’t access identity verification details.
          </p>
          <p className="font-ui-2sm margin-bottom-0">
            Why we verify your identity
          </p>
          <p className="font-ui-2xs text-base margin-top-0">
            Identity verification helps protect organizations working with
            personal health information.
          </p>
          {Object.entries(personalDetailsFields).map(
            ([key, { label, required, preheader }]) => {
              const field = key as keyof IdentityVerificationRequest;
              return (
                <div key={field}>
                  {preheader && (
                    <p className="font-ui-sm text-bold margin-bottom-1">
                      {preheader}
                    </p>
                  )}
                  {getFormElement(field, label, required, preheader)}
                </div>
              );
            }
          )}
        </div>
        <Button
          className="width-full"
          disabled={saving || !formChanged}
          onClick={onSave}
          label={saving ? "Saving..." : "Submit"}
        />
      </Card>
    </CardBackground>
  );
};

export default PersonalDetailsForm;
