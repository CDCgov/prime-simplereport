import React, { ComponentProps } from "react";
import { useDispatch, useSelector } from "react-redux";
import { gql, useQuery, useMutation } from "@apollo/client";
import { toast } from "react-toastify";
import {
  useAppInsightsContext,
  useTrackEvent,
} from "@microsoft/applicationinsights-react-js";

import Alert from "../commonComponents/Alert";
import { showNotification } from "../utils";
import { RootState, updateOrganization } from "../store";

import ManageOrganization from "./ManageOrganization";

interface Data {
  organization: {
    name: string;
    type: OrganizationType;
  };
}

export type EditableOrganization = Data["organization"];

export const GET_ORGANIZATION = gql`
  query GetOrganization {
    organization {
      name
      type
    }
  }
`;

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
  const { data, loading, error } = useQuery<Data, {}>(GET_ORGANIZATION, {
    fetchPolicy: "no-cache",
  });
  const dispatch = useDispatch();
  const isSuperUser = useSelector<RootState, boolean>(
    (state) => state.user.isAdmin
  );
  const [adminSetOrganization] = useMutation(ADMIN_SET_ORGANIZATION);
  const [setOrganization] = useMutation(SET_ORGANIZATION);
  const appInsights = useAppInsightsContext();
  const trackSaveSettings = useTrackEvent(
    appInsights,
    "Save Organization",
    null
  );

  if (loading) {
    return <p> Loading... </p>;
  }
  if (error) {
    return error;
  }

  if (data === undefined) {
    return <p>Error: setting not found</p>;
  }

  const onSave = async ({ name, type }: EditableOrganization) => {
    if (appInsights) {
      trackSaveSettings(null);
    }
    const mutation = isSuperUser
      ? () => adminSetOrganization({ variables: { name, type } })
      : () => setOrganization({ variables: { type } });

    const alertProps: ComponentProps<typeof Alert> = {
      type: "success",
      title: "Updated Organization",
      body: "The settings for the organization have been updated",
    };

    try {
      await mutation();
      dispatch(updateOrganization({ name }));
    } catch (e) {
      alertProps.type = "error";
      alertProps.title = "Error Updating Organization";
      alertProps.body =
        "There was an eroror updating the organization settings";
    }
    showNotification(toast, <Alert {...alertProps} />);
  };

  return (
    <ManageOrganization
      organization={data.organization}
      onSave={onSave}
      canEditOrganizationName={isSuperUser}
    />
  );
};

export default ManageOrganizationContainer;
