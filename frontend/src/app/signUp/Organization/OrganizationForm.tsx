import { useState } from "react";
import { toast } from "react-toastify";
import { Redirect } from "react-router";

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
import { TextWithTooltip } from "../../commonComponents/TextWithTooltip";
import { SignUpApi } from "../SignUpApi";
import { LoadingCard } from "../../commonComponents/LoadingCard/LoadingCard";
import { PersonalDetailsFormProps } from "../IdentityVerification/PersonalDetailsForm";
import StepIndicator from "../../commonComponents/StepIndicator";

import {
  initOrg,
  initOrgErrors,
  organizationFields,
  OrganizationTypeEnum,
  organizationSchema as schema,
} from "./utils";

import "./OrganizationForm.scss";

export interface OrganizationCreateRequest {
  name: string;
  type: OrganizationType | "";
  state: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  email: string;
  workPhoneNumber: string;
}

export interface OrganizationCreateResponse {
  orgExternalId: string;
}

type OrganizationFormErrors = Record<keyof OrganizationCreateRequest, string>;

const OrganizationForm = () => {
  const [organization, setOrganization] = useState<OrganizationCreateRequest>(
    initOrg()
  );
  const [errors, setErrors] = useState<OrganizationFormErrors>(initOrgErrors());

  const [loading, setLoading] = useState(false);
  const [formChanged, setFormChanged] = useState(false);
  const [orgExternalId, setOrgExternalId] = useState("");

  const onDetailChange = (field: keyof OrganizationCreateRequest) => (
    value: OrganizationCreateRequest[typeof field]
  ) => {
    setFormChanged(true);
    setOrganization({ ...organization, [field]: value });
  };

  const validateField = async (field: keyof OrganizationCreateRequest) => {
    setErrors(
      await isFieldValid({ data: organization, schema, errors, field })
    );
  };

  const getValidationStatus = (field: keyof OrganizationCreateRequest) =>
    errors[field] ? "error" : undefined;

  const onSave = async () => {
    setLoading(true);
    const validation = await isFormValid({
      data: organization,
      schema,
    });
    if (validation.valid) {
      try {
        const res = await SignUpApi.createOrganization(organization);
        setOrgExternalId(res.orgExternalId);
      } catch (error) {
        const alert = (
          <Alert type="error" title="Submission Error" body={error} />
        );
        showNotification(toast, alert);
        setLoading(false);
        return;
      }
      setErrors(initOrgErrors());
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
    setLoading(false);
  };

  if (orgExternalId) {
    return (
      <Redirect
        to={{
          pathname: "/sign-up/identity-verification",
          state: {
            orgExternalId: orgExternalId,
            firstName: organization.firstName,
            middleName: organization.middleName,
            lastName: organization.lastName,
          } as PersonalDetailsFormProps,
        }}
      />
    );
  }

  if (loading) {
    return <LoadingCard message="Creating organization" />;
  }

  // This function is just a simple switch statement
  // that returns the appropriate component for each
  // form field. Reduces duplication.
  const getFormElement = (
    field: keyof OrganizationCreateRequest,
    label: string | React.ReactNode,
    required: boolean
  ) => {
    switch (field) {
      case "state":
        return (
          <Select
            label={label}
            name="state"
            value={organization.state || ""}
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
      case "type":
        return (
          <Select
            label={label}
            name="type"
            value={organization.type || ""}
            options={Object.entries(
              OrganizationTypeEnum
            ).map(([key, value]) => ({ label: value, value: key }))}
            defaultSelect
            onChange={onDetailChange("type")}
            onBlur={() => {
              validateField("type");
            }}
            validationStatus={getValidationStatus("type")}
            errorMessage={errors.type}
            required
          />
        );
      default:
        // This is not a field, just some explanatory text
        if (label === "Organization administrator") {
          return (
            <>
              <label className="usa-label margin-top-3">
                <strong>{label}</strong>
                <TextWithTooltip
                  tooltip="Can be anyone that works at your organization. Adds testing facility locations; manages the account and user access."
                  text="What's an organization administrator?"
                />
              </label>
              <p className="usa-hint">
                Only one person from an organization can be the administrator.
                This person will submit information for identity verification.
              </p>
            </>
          );
        }
        return (
          <Input
            label={label}
            type={"text"}
            field={field}
            key={field}
            formObject={organization}
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
      <Card logo>
        <div className="margin-bottom-2 organization-form">
          <h4 className="margin-bottom-0">Sign up for SimpleReport</h4>
          <StepIndicator
            steps={organizationCreationSteps}
            currentStepValue={"0"}
            noLabels={true}
            segmentIndicatorOnBottom={true}
          />
          {/* By mapping over organizationFields (found in utils.tsx), we reduce */}
          {/* duplication of input fields in JSX */}
          {Object.entries(organizationFields).map(
            ([key, { label, required }]) => {
              const field = key as keyof OrganizationCreateRequest;
              return (
                <div key={field}>{getFormElement(field, label, required)}</div>
              );
            }
          )}
        </div>
        <p>
          By submitting this form, you agree to our{" "}
          <a href="/terms-of-service" target="_blank" rel="noopener noreferrer">
            terms of service
          </a>
          .
        </p>
        <Button
          className="width-full margin-top-2 submit-button"
          disabled={!formChanged}
          onClick={onSave}
          label={"Submit"}
        />
      </Card>
    </CardBackground>
  );
};

export default OrganizationForm;
