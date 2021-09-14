/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: AllSelfRegistrationLinks
// ====================================================

export interface AllSelfRegistrationLinks_whoami_organization_facilities {
  __typename: "Facility";
  name: string | null;
  patientSelfRegistrationLink: string | null;
}

export interface AllSelfRegistrationLinks_whoami_organization {
  __typename: "Organization";
  patientSelfRegistrationLink: string | null;
  facilities: AllSelfRegistrationLinks_whoami_organization_facilities[];
}

export interface AllSelfRegistrationLinks_whoami {
  __typename: "User";
  organization: AllSelfRegistrationLinks_whoami_organization | null;
}

export interface AllSelfRegistrationLinks {
  whoami: AllSelfRegistrationLinks_whoami;
}
