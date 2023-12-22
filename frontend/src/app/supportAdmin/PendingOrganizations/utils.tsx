export interface PendingOrganizationFormValues {
  name: string;
  adminFirstName: string | undefined;
  adminLastName: string | undefined;
  adminEmail: string | undefined;
  adminPhone: string | undefined;
}

export interface EditOrgMutationResponse {
  data: {
    editPendingOrganization: string;
  };
}
