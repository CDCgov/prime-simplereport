import * as yup from "yup";

import { TextWithTooltip } from "../../commonComponents/TextWithTooltip";
import { phoneNumberIsValid } from "../../patients/personSchema";
import { liveJurisdictions } from "../../../config/constants";

import { OrganizationCreateRequest } from "./OrganizationForm";

export const OrganizationTypeEnum = {
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
  primary_care: "Primary care / Mental health outpatient",
  treatment_center: "Substance abuse treatment center",
  urgent_care: "Urgent care",
};

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
    "If you have only one location, enter that name for both your organization name and testing facility name.",
  ],
  ["state", "Organization state", true, null],
  ["type", "Organization type", true, null],
  ["banner", "Organization administrator", false, null],
  ["firstName", "First name", true, null],
  ["middleName", "Middle name", false, null],
  ["lastName", "Last name", true, null],
  ["email", "Email address", true, null],
  ["workPhoneNumber", "Work phone number", true, null],
].reduce((fields, field) => {
  fields[field[0] as keyof OrganizationCreateRequest] = {
    label: field[1] as string | React.ReactNode,
    required: field[2] as boolean,
    subheader: field[3] as string | null,
  };
  return fields;
}, {} as { [key: string]: { label: string | React.ReactNode; required: boolean; subheader: string | null } });

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
      SimpleReport isn't available yet in your state. For more information, view{" "}
      <a href="https://simplereport.gov/using-simplereport/manage-facility-info/find-supported-jurisdictions">
        supported jurisdictions
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
