import React from "react";
import { gql, useQuery, useMutation } from "@apollo/client";
import { toast } from "react-toastify";
import {
  useAppInsightsContext,
  useTrackEvent,
} from "@microsoft/applicationinsights-react-js";

import Alert from "../commonComponents/Alert";
import { showNotification } from "../utils";
import ManageOrganization from "./ManageOrganization";

interface Data {
  organization: {
    name: string;
  };
}

const GET_ORGANIZATION = gql`
  {
    organization {
      name
    }
  }
`;

const SET_ORGANIZATION = gql`
  mutation($name: String) {
    updateOrganization(name: $name)
  }
`;

const ManageOrganizationContainer: any = () => {
  const { data, loading, error } = useQuery<Data, {}>(GET_ORGANIZATION, {
    fetchPolicy: "no-cache",
  });
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
    trackSaveSettings(null);
    setOrganization({
      variables: {
        name,
      },
    }).then((d) => {
      console.log("success!", d); // TODO: should return an id
      let alert = (
        <Alert
          type={"success"}
          title={"Updated Organization"}
          body={"The settings for the organization have been updated"}
          role={"success"}
        />
      );
      showNotification(toast, alert);
    });
  };

  return <ManageOrganization name={data.organization.name} onSave={onSave} />;
};

export default ManageOrganizationContainer;
