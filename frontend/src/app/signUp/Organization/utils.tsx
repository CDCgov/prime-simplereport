import * as yup from "yup";

import { TextWithTooltip } from "../../commonComponents/TextWithTooltip";

import { OrganizationCreateRequest } from "./OrganizationForm";

enum OrganizationTypeEnum {
  k12 = "k12",
  university = "university",
  correctional_facility = "correctional_facility",
  airport = "airport",
  shelter = "shelter",
  fqhc = "fqhc",
  primary_care = "primary_care",
  assisted_living = "assisted_living",
  hospital = "hospital",
  urgent_care = "urgent_care",
  nursing_home = "nursing_home",
  treatment_center = "treatment_center",
  hospice = "hospice",
  pharmacy = "pharmacy",
  employer = "employer",
  government_agency = "government_agency",
  camp = "camp",
  lab = "lab",
  other = "other",
}

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
  ["type", "Organization administrator", false, null],
  ["firstName", "First name", true, null],
  ["middleName", "Middle name", false, null],
  ["lastName", "Last name", true, null],
  ["email", "Email", true, null],
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

export const organzationSchema: yup.SchemaOf<OrganizationCreateRequest> = yup
  .object()
  .shape({
    name: yup.string().required("Name is required"),
    type: yup
      .mixed()
      .oneOf(Object.keys(OrganizationTypeEnum))
      .required("Type is required"),
    state: yup.string().required("State is required"),
    firstName: yup.string().required("First name is required"),
    middleName: yup.string().nullable(),
    lastName: yup.string().required("Last name is required"),
    email: yup.string().email().required("Email is required"),
    workPhoneNumber: yup.string().required("Phone number is required"),
  });
