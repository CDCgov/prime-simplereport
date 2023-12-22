import React, { ReactElement, useEffect, useRef, useState } from "react";
import { Navigate } from "react-router-dom";

import { Card } from "../../commonComponents/Card/Card";
import { CardBackground } from "../../commonComponents/CardBackground/CardBackground";
import Button from "../../commonComponents/Button/Button";
import { showError } from "../../utils/srToast";
import { useDocumentTitle } from "../../utils/hooks";
import { isFormValid, isFieldValid } from "../../utils/yupHelpers";
import { focusOnFirstInputWithError } from "../../utils/formValidation";
import Input from "../../commonComponents/Input";
import {
  organizationCreationSteps,
  stateCodes,
  liveJurisdictions,
  FORM_ERROR_MSG,
  FORM_ERROR_TITLE,
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
  organizationBackendErrors,
} from "./utils";
import "./OrganizationForm.scss";
import { UnsupportedStateModal } from "./UnsupportedStateModal";

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
  const [stateModalOpen, setStateModalOpen] = useState(false);
  const [errors, setErrors] = useState<OrganizationFormErrors>(initOrgErrors());
  const focusOnce = useRef(false);
  const [backendError, setBackendError] = useState<ReactElement>();

  const [loading, setLoading] = useState(false);
  const [formChanged, setFormChanged] = useState(false);
  const [orgExternalId, setOrgExternalId] = useState("");
  useDocumentTitle("Sign up - organization information");

  const onDetailChange =
    (field: keyof OrganizationCreateRequest) =>
    (value: OrganizationCreateRequest[typeof field]) => {
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
      } catch (error: any) {
        const message = error.message || error;
        setBackendError(organizationBackendErrors(message));
        setLoading(false);
        window.scrollTo(0, 0);
        return;
      }
      setErrors(initOrgErrors());
      return;
    }
    // @ts-ignore
    setErrors(validation.errors);
    focusOnce.current = true;
    showError(FORM_ERROR_MSG, FORM_ERROR_TITLE);
    setLoading(false);
  };
  /**
   * Place focus after errors are displayed
   */
  useEffect(() => {
    if (
      focusOnce.current &&
      (errors.name ||
        errors.state ||
        errors.type ||
        errors.firstName ||
        errors.lastName ||
        errors.email ||
        errors.workPhoneNumber)
    ) {
      focusOnFirstInputWithError();
      focusOnce.current = false;
    }
  }, [errors]);

  const validateSupportedJurisdiction = async () => {
    if (organization.state && !liveJurisdictions.includes(organization.state)) {
      setStateModalOpen(true);
    }
  };

  if (orgExternalId) {
    return (
      <Navigate
        to="/sign-up/identity-verification"
        state={
          {
            orgExternalId: orgExternalId,
            firstName: organization.firstName,
            middleName: organization.middleName,
            lastName: organization.lastName,
          } as PersonalDetailsFormProps
        }
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
    required: boolean,
    hintText: string
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
              validateSupportedJurisdiction();
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
            options={Object.entries(OrganizationTypeEnum).map(
              ([key, value]) => ({ label: value, value: key })
            )}
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
                <strong>
                  <TextWithTooltip
                    tooltip="Can be anyone that works at your organization. Adds testing facility locations; manages the account and user access."
                    text="Organization administrator"
                    position="right"
                  />
                </strong>
              </label>
              <p className="usa-hint">
                To start, only one person from an organization can be the
                administrator. This person will submit information for identity
                verification. (SimpleReport doesn't access or keep personal
                identity information.)
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
            hintText={hintText}
          />
        );
    }
  };

  return (
    <CardBackground>
      <Card logo cardIsForm>
        <div className="margin-bottom-2 organization-form usa-prose">
          <h1 className="margin-top-2 margin-bottom-0">
            Sign up for SimpleReport
          </h1>
          <StepIndicator
            steps={organizationCreationSteps}
            currentStepValue={"0"}
            noLabels={true}
            segmentIndicatorOnBottom={true}
            headingLevel="h2"
          />
          <div className="gray-background padding-y-05 padding-x-3">
            <p className="font-ui-2xs line-height-sans-5 margin-bottom-1">
              <strong>Sign up for SimpleReport in three steps:</strong>
            </p>
            <ol className="prime-ul">
              <li>
                <div className="margin-y-1">
                  <span className="circled-number margin-right-05">1</span>
                  Fill out your organization information
                </div>
              </li>
              <li>
                <div className="margin-y-1">
                  <span className="circled-number margin-right-05">2</span>
                  Enter your personal contact details
                </div>
              </li>
              <li>
                <div className="margin-y-1">
                  <span className="circled-number margin-right-05">3</span>
                  Verify your identity
                </div>
              </li>
            </ol>
            <p className="font-ui-2xs margin-top-2 line-height-sans-5">
              Each organization only needs one account. After you sign up you
              can add staff and testing locations. Learn more about our{" "}
              <a href="/getting-started/organizations-and-testing-facilities/onboard-your-organization/">
                sign up and identity verification process
              </a>
              .
            </p>
          </div>
          {backendError ? backendError : null}
          {/* By mapping over organizationFields (found in utils.tsx), we reduce */}
          {/* duplication of input fields in JSX */}

          {Object.entries(organizationFields).map(
            ([key, { label, required, hintText }]) => {
              const field = key as keyof OrganizationCreateRequest;
              return (
                <div key={field}>
                  {getFormElement(field, label, required, hintText)}
                </div>
              );
            }
          )}
        </div>
        <p className="margin-top-4 margin-bottom-0 font-ui-xs">
          By selecting Continue, you agree to our{" "}
          <a href="/terms-of-service" target="_blank" rel="noopener noreferrer">
            terms of service
          </a>
          .
        </p>
        <Button
          className="width-full margin-top-2 submit-button"
          disabled={!formChanged}
          onClick={onSave}
          label={"Continue"}
        />
      </Card>
      <UnsupportedStateModal
        showModal={stateModalOpen}
        state={organization.state}
        onClose={(clearField: boolean) => {
          if (clearField) {
            setOrganization({ ...organization, state: "" });
          }
          setStateModalOpen(false);
        }}
      />
    </CardBackground>
  );
};

export default OrganizationForm;
