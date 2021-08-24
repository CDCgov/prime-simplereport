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
import {
  organizationCreationSteps,
  stateCodes,
} from "../../../config/constants";
import Select from "../../commonComponents/Select";
import StepIndicator from "../../commonComponents/StepIndicator";

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

export type PersonalDetailsFormProps = {
  orgExternalId: string;
  firstName: string;
  middleName: string;
  lastName: string;
};

const PersonalDetailsForm = ({
  orgExternalId,
  firstName,
  middleName,
  lastName,
}: PersonalDetailsFormProps) => {
  const [
    personalDetails,
    setPersonalDetails,
  ] = useState<IdentityVerificationRequest>(
    initPersonalDetails(orgExternalId, firstName, middleName, lastName)
  );
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

  if (orgExternalId === null) {
    return (
      <CardBackground>
        <Card logo bodyKicker={"Invalid request"} bodyKickerCentered={true}>
          <p className="text-center">
            We weren't able to find your affiliated organization
          </p>
        </Card>
      </CardBackground>
    );
  }

  if (submitted) {
    return (
      <QuestionsFormContainer
        personalDetails={personalDetails}
        orgExternalId={orgExternalId}
      />
    );
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
              className="font-ui-sm margin-top-2 margin-bottom-0"
            >
              Date of birth
            </Label>
            <span className="usa-hint">mm/dd/yyyy</span>
            <DatePicker
              id={field}
              data-testid={field}
              name={field}
              onChange={(date) => {
                if (date) {
                  const newDate = moment(date, "MM/DD/YYYY")
                    .hour(now.hours())
                    .minute(now.minutes());
                  onDetailChange("dateOfBirth")(newDate.format("YYYY-MM-DD"));
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

  const getPersonFullName = () =>
    [
      personalDetails.firstName,
      personalDetails.middleName,
      personalDetails.lastName,
    ].join(" ");

  return (
    <CardBackground>
      <Card logo>
        <h4 className="margin-bottom-0">Sign up for SimpleReport</h4>
        <StepIndicator
          steps={organizationCreationSteps}
          currentStepValue={"1"}
          noLabels={true}
          segmentIndicatorOnBottom={true}
        />
        <div className="margin-bottom-2">
          <p className="font-ui-2xs text-base">
            To create your account, we’ll need information to verify your
            identity directly with{" "}
            <a
              href="https://www.experian.com/decision-analytics/identity-proofing"
              target="_blank"
              rel="noopener noreferrer"
            >
              Experian
            </a>
            . SimpleReport doesn’t access identity verification details.
          </p>
          <p className="font-ui-2sm margin-bottom-0">
            Why we verify your identity
          </p>
          <p className="font-ui-2xs text-base margin-top-1">
            Identity verification helps protect organizations working with
            personal health information.
          </p>
          <h3>{getPersonFullName()}</h3>
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
