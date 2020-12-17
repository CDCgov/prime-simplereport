import React, { useContext } from "react";
import { connect } from "react-redux";
import { gql, useMutation } from "@apollo/client";
import { toast } from "react-toastify";
import {
  useAppInsightsContext,
  useTrackEvent,
} from "@microsoft/applicationinsights-react-js";

import Alert from "../commonComponents/Alert";
import { showNotification } from "../utils";
import ManageOrganization from "./ManageOrganization";
import { WhoAmIContext } from "../WhoAmIContext";

const SET_ORGANIZATION = gql`
  mutation($name: String!) {
    updateOrganization(name: $name)
  }
`;

const ManageOrganizationContainer: any = () => {
  let { organization, updateOrganization } = useContext(WhoAmIContext);
  const [setOrganization] = useMutation(SET_ORGANIZATION);
  const appInsights = useAppInsightsContext();
  const trackSaveSettings = useTrackEvent(
    appInsights,
    "Save Organization",
    null,
    false
  );

  const onSave = (name: string) => {
    trackSaveSettings(null);
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
      updateOrganization({ name });
    });
  };

  return <ManageOrganization name={organization.name} onSave={onSave} />;
};

export default connect()(ManageOrganizationContainer);
