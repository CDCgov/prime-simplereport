import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { gql, useMutation } from "@apollo/client";

import { getAppInsights } from "../TelemetryService";
import { showError, showSuccess } from "../utils/srToast";
import { RootState, updateOrganization } from "../store";
import { useDocumentTitle } from "../utils/hooks";
import { useGetCurrentOrganizationQuery } from "../../generated/graphql";

import ManageOrganization from "./ManageOrganization";

export const ADMIN_SET_ORGANIZATION = gql`
  mutation AdminSetOrganization($name: String!, $type: String!) {
    adminUpdateOrganization(name: $name, type: $type)
  }
`;

export const SET_ORGANIZATION = gql`
  mutation SetOrganization($type: String!) {
    updateOrganization(type: $type)
  }
`;

const ManageOrganizationContainer: any = () => {
  useDocumentTitle("Manage organization");

  const { data, loading, error } = useGetCurrentOrganizationQuery({
    fetchPolicy: "no-cache",
  });
  const dispatch = useDispatch();
  const isSuperUser = useSelector<RootState, boolean>(
    (state) => state.user.isAdmin
  );
  const [adminSetOrganization] = useMutation(ADMIN_SET_ORGANIZATION);
  const [setOrganization] = useMutation(SET_ORGANIZATION);
  const appInsights = getAppInsights();

  if (loading) {
    return <p> Loading... </p>;
  }
  if (error) {
    return error;
  }

  if (data === undefined) {
    return <p>Error: setting not found</p>;
  }

  const onSave = async ({ name, type }: OrganizationForm) => {
    if (appInsights) {
      appInsights.trackEvent({ name: "Save Organization" });
    }
    const mutation = isSuperUser
      ? () => adminSetOrganization({ variables: { name, type } })
      : () => setOrganization({ variables: { type } });

    try {
      await mutation();
      dispatch(updateOrganization({ name }));
      showSuccess(
        "The settings for the organization have been updated",
        "Updated organization"
      );
    } catch (e: any) {
      showError(
        "There was an error updating the organization settings",
        "Error updating organization"
      );
      throw e;
    }
  };

  return (
    <ManageOrganization
      organization={data.whoami.organization as OrganizationForm}
      onSave={onSave}
      canEditOrganizationName={isSuperUser}
    />
  );
};

export default ManageOrganizationContainer;
