import * as yup from "yup";
import { ReactElement } from "react";

import { TextWithTooltip } from "../../commonComponents/TextWithTooltip";
import { phoneNumberIsValid } from "../../patients/personSchema";
import { liveJurisdictions } from "../../../config/constants";
import Alert from "../../commonComponents/Alert";

import { OrganizationCreateRequest } from "./OrganizationForm";

export const OrganizationTypeEnum: { [key in OrganizationType]: string } = {
  airport: "Airport/Transit station",
  assisted_living: "Assisted living facility",
  camp: "Camp",
  university: "College/University",
  correctional_facility: "Correctional facility",
  employer: "Employer",
  fqhc: "Federally Qualified Health Center (FQHC)",
  government_agency: "Government agency",
  shelter: "Homeless shelter",
  hospice: "Hospice",
  hospital: "Hospital or clinic",
  k12: "K-12 school",
  lab: "Lab",
  nursing_home: "Nursing home",
  other: "Other",
  pharmacy: "Pharmacy",
  primary_care: "Primary care/Mental health outpatient",
  treatment_center: "Substance use disorder treatment center",
  urgent_care: "Urgent care",
};

// This object contains a map of all the fields in the form
// It also contains the input labels and whether the input is required
// The object is iterated over in OrganizationForm.tsx using
// Object.entries() to generate the form
export const organizationFields = [
  [
    "name",
    <span>
      What's the name of your{" "}
      <TextWithTooltip
        text="organization?"
        tooltip="Organizations have multiple testing facilities or locations as part of their network."
        position="top"
      />
    </span>,
    true,
    "",
  ],
  ["state", "Organization state", true, ""],
  ["type", "Organization type", true, ""],
  ["banner", "Organization administrator", false, ""],
  ["firstName", "First name", true, ""],
  ["middleName", "Middle name", false, ""],
  ["lastName", "Last name", true, ""],
  ["email", "Work email", true, "Enter your individual work email address."],
  [
    "workPhoneNumber",
    "Work phone number",
    true,
    "Enter your direct work phone number.",
  ],
].reduce((fields, field) => {
  fields[field[0] as keyof OrganizationCreateRequest] = {
    label: field[1] as string | React.ReactNode,
    required: field[2] as boolean,
    hintText: field[3] as string,
  };
  return fields;
}, {} as { [key: string]: { label: string | React.ReactNode; required: boolean; hintText: string } });

export const initOrg = (): OrganizationCreateRequest => ({
  name: "",
  type: "",
  state: "",
  firstName: "",
  middleName: "",
  lastName: "",
  email: "",
  workPhoneNumber: "",
});

export const initOrgErrors = (): Record<
  keyof OrganizationCreateRequest,
  string
> => ({
  name: "",
  type: "",
  state: "",
  firstName: "",
  middleName: "",
  lastName: "",
  email: "",
  workPhoneNumber: "",
});

const getStateErrorMessage = (param: any) =>
  param.value !== "" ? (
    <>
      SimpleReport isn't available yet in your state. View{" "}
      <a
        href="https://simplereport.gov/using-simplereport/manage-facility-info/find-supported-jurisdictions"
        target="_blank"
        rel="noopener noreferrer"
      >
        supported jurisdictions
      </a>{" "}
      or sign up for our{" "}
      <a
        href="https://simplereport.gov/waitlist"
        target="_blank"
        rel="noopener noreferrer"
      >
        waitlist
      </a>
      .
    </>
  ) : (
    "Organization state is required"
  );

export const organizationSchema: yup.SchemaOf<OrganizationCreateRequest> = yup
  .object()
  .shape({
    name: yup.string().required("Organization name is required"),
    type: yup
      .mixed()
      .oneOf(Object.keys(OrganizationTypeEnum), "Organization type is required")
      .required(),
    state: yup
      .mixed()
      .oneOf(liveJurisdictions, getStateErrorMessage)
      .required(),
    firstName: yup.string().required("First name is required"),
    middleName: yup.string().nullable(),
    lastName: yup.string().required("Last name is required"),
    email: yup
      .string()
      .email("A valid email address is required")
      .required("A valid email address is required"),
    workPhoneNumber: yup
      .mixed()
      .test("", "A valid phone number is required", phoneNumberIsValid)
      .required(),
  });

export const organizationBackendErrors = (error: string): ReactElement => {
  switch (error) {
    // Duplicate org. Admin user is attempting to resign up but has already completed identity verification.
    case "Duplicate organization with admin user who has completed identity verification.":
      return (
        <Alert type="error" title="Duplicate organization">
          Your organization is already registered with SimpleReport. Check your
          email for instructions on setting up your account.
        </Alert>
      );
    // Duplicate org. Admin user is attempting to resign up and hasn't finished identity verification.
    case "Duplicate organization with admin user that has not completed identity verification.":
      return (
        <Alert type="error" title="Duplicate organization">
          Your organization is already registered with SimpleReport. To begin
          using it, schedule a time to complete our{" "}
          <a href="https://outlook.office365.com/owa/calendar/Helpdesk@HHSGOV.onmicrosoft.com/bookings/s/HOX7KgZruESJksIgC8qVxQ2">
            online identity verification.
          </a>{" "}
        </Alert>
      );
    // Duplicate org. Non-admin user is attempting to reregister the organization.
    case "This organization has already registered with SimpleReport.":
      return (
        <Alert type="error" title="Duplicate organization">
          This organization already has a SimpleReport account. Please contact
          your organization administrator to request access.
        </Alert>
      );
    // Email already exists in SimpleReport (user is potentially already in another org.)
    case "This email address is already associated with a SimpleReport user.":
      return (
        <Alert type="error" title="Email already registered">
          This email address is already registered with SimpleReport. Please
          contact your organization administrator or{" "}
          <a href="mailto:support@simplereport.gov">support@simplereport.gov</a>{" "}
          for help.
        </Alert>
      );
    // Okta internal error.
    case "An unknown error occured when creating this organization in Okta.":
      return (
        <Alert type="error" title="Unexpected error">
          An unexpected error occured. Please resubmit this form, or contact{" "}
          <a href="mailto:support@simplereport.gov">support@simplereport.gov</a>{" "}
          if the problem persists.
        </Alert>
      );
    default:
      return (
        <Alert type="error" title="Submission error">
          {error} Please contact your organization administrator or{" "}
          <a href="mailto:support@simplereport.gov">support@simplereport.gov</a>{" "}
          for help.
        </Alert>
      );
  }
};
