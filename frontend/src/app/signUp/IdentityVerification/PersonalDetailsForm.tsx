import { useEffect, useRef, useState } from "react";

import { Card } from "../../commonComponents/Card/Card";
import { CardBackground } from "../../commonComponents/CardBackground/CardBackground";
import Button from "../../commonComponents/Button/Button";
import { showError } from "../../utils/srToast";
import { isFormValid, isFieldValid } from "../../utils/yupHelpers";
import Input from "../../commonComponents/Input";
import {
  FORM_ERROR_MSG,
  FORM_ERROR_TITLE,
  organizationCreationSteps,
  stateCodes,
} from "../../../config/constants";
import Select from "../../commonComponents/Select";
import StepIndicator from "../../commonComponents/StepIndicator";
import { useDocumentTitle } from "../../utils/hooks";
import { formatDate } from "../../utils/date";
import { focusOnFirstInputWithError } from "../../utils/formValidation";

import {
  initPersonalDetails,
  initPersonalDetailsErrors,
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
  const [personalDetails, setPersonalDetails] =
    useState<IdentityVerificationRequest>(
      initPersonalDetails(orgExternalId, firstName, middleName, lastName)
    );
  const [errors, setErrors] = useState<PersonalDetailsFormErrors>(
    initPersonalDetailsErrors()
  );
  const focusOnce = useRef(false);

  const [saving, setSaving] = useState(false);
  const [formChanged, setFormChanged] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  useDocumentTitle("Sign up - personal details");

  const onDetailChange =
    (field: keyof IdentityVerificationRequest) =>
    (value: IdentityVerificationRequest[typeof field]) => {
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
    // @ts-ignore
    setErrors(validation.errors);
    focusOnce.current = true;
    showError(FORM_ERROR_MSG, FORM_ERROR_TITLE);
    setSaving(false);
  };

  /**
   * Focus on the first input with errors
   */
  useEffect(() => {
    if (
      focusOnce.current &&
      (errors.dateOfBirth ||
        errors.email ||
        errors.phoneNumber ||
        errors.streetAddress1 ||
        errors.city ||
        errors.state ||
        errors.zip)
    ) {
      focusOnFirstInputWithError(true);
      focusOnce.current = false;
    }
  }, [errors]);

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
    field: keyof IdentityVerificationRequest | `preheader${"1" | "2"}`,
    label: string,
    required: boolean,
    hintText: string,
    id: string
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
        return (
          <Input
            label={label}
            type={"date"}
            field={field}
            key={field}
            formObject={personalDetails}
            onChange={onDetailChange}
            errors={errors}
            validate={validateField}
            getValidationStatus={getValidationStatus}
            required={required}
            hintText={hintText}
            min={formatDate(new Date("Jan 1, 1900"))}
            max={formatDate(new Date())}
          />
        );
      case "preheader1":
      case "preheader2":
        return (
          <p className="font-ui-sm text-bold margin-bottom-1" id={id}>
            {label}
          </p>
        );
      default:
        return (
          <Input
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
            hintText={hintText}
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

  const personalContactGroupHeader = "personal-contact-group-header";
  const homeAddressGroupHeader = "home-address-group-header";

  return (
    <CardBackground>
      <Card logo cardIsForm>
        <h1 className="margin-bottom-0 font-ui-xs">Sign up for SimpleReport</h1>
        <StepIndicator
          steps={organizationCreationSteps}
          currentStepValue={"1"}
          noLabels={true}
          segmentIndicatorOnBottom={true}
          headingLevel="h2"
        />
        <div className="margin-bottom-2 organization-form">
          <div>
            <p className="margin-top-neg-2">
              To create your account, we’ll need information to verify your
              identity directly with{" "}
              <a
                href="https://www.experian.com/decision-analytics/identity-proofing"
                target="_blank"
                rel="noopener noreferrer"
              >
                Experian
              </a>
              . SimpleReport doesn’t access or keep identity verification
              details.
            </p>
            <p className="font-ui-md margin-bottom-0">
              Why we verify your identity
            </p>
            <p className="font-ui-2xs text-base margin-top-1">
              Identity verification helps protect organizations working with
              personal health information.
            </p>
            <h2 className="questions-form-name">{getPersonFullName()}</h2>
          </div>
          {getFormElement("dateOfBirth", "Date of birth", true, "", "")}
          {getFormElement(
            "preheader1",
            "Personal contact information",
            false,
            "",
            personalContactGroupHeader
          )}
          <div role="group" aria-labelledby={personalContactGroupHeader}>
            {getFormElement(
              "email",
              "Email",
              true,
              "Enter your non-work email address.",
              ""
            )}
            {getFormElement(
              "phoneNumber",
              "Phone number",
              true,
              "Enter your non-work phone number.",
              ""
            )}
          </div>
          {getFormElement(
            "preheader2",
            "Home address",
            false,
            "",
            homeAddressGroupHeader
          )}
          <div role={"group"} aria-labelledby={homeAddressGroupHeader}>
            {getFormElement("streetAddress1", "Street address 1", true, "", "")}
            {getFormElement(
              "streetAddress2",
              "Street address 2",
              false,
              "",
              ""
            )}
            {getFormElement("city", "City", true, "", "")}
            {getFormElement("state", "State", true, "", "")}
            {getFormElement("zip", "ZIP code", true, "", "")}
          </div>
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
