import React from "react";
import { useDispatch, connect } from "react-redux";
import { gql, useQuery, useMutation } from "@apollo/client";
import { toast } from "react-toastify";
import {
  useAppInsightsContext,
  useTrackEvent,
} from "@microsoft/applicationinsights-react-js";

import Alert from "../commonComponents/Alert";
import { showNotification } from "../utils";
import { updateOrganization } from "../store";

import ManageOrganization from "./ManageOrganization";

interface Data {
  organization: {
    name: string;
  };
}

const GET_ORGANIZATION = gql`
  query GetOrganization {
    organization {
      name
    }
  }
`;

const SET_ORGANIZATION = gql`
  mutation SetOrganization($name: String!) {
    updateOrganization(name: $name)
  }
`;

const ManageOrganizationContainer: any = () => {
  const { data, loading, error } = useQuery<Data, {}>(GET_ORGANIZATION, {
    fetchPolicy: "no-cache",
  });
  const dispatch = useDispatch();
  const [setOrganization] = useMutation(SET_ORGANIZATION);
  const appInsights = useAppInsightsContext();
  const trackSaveSettings = useTrackEvent(
    appInsights,
    "Save Organization",
    null,
    false
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

  const onSave = (name: string) => {
    if (appInsights) {
      trackSaveSettings(null);
    }
    setOrganization({
      variables: {
        name,
      },
    }).then((d) => {
      let alert = (
        <Alert
          type="success"
          title="Updated Organization"
          body="The settings for the organization have been updated"
        />
      );
      showNotification(toast, alert);
      dispatch(updateOrganization({ name }));
    });
  };

  return <ManageOrganization name={data.organization.name} onSave={onSave} />;
};

export default connect()(ManageOrganizationContainer);
