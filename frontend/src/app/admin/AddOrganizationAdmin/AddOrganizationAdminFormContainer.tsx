import { useState } from "react";
import {
  useAppInsightsContext,
  useTrackEvent,
} from "@microsoft/applicationinsights-react-js";
import { Redirect } from "react-router-dom";

import Alert from "../../commonComponents/Alert";
import { showNotification } from "../../utils";
import { LoadingCard } from "../../commonComponents/LoadingCard/LoadingCard";
import {
  useAddUserMutation,
  useGetOrganizationsQuery,
  Role,
} from "../../../generated/graphql";

import AddOrganizationAdminForm from "./AddOrganizationAdminForm";

const AddOrganizationAdminFormContainer = () => {
  const [submitted, setSubmitted] = useState(false);
  const { data, loading, error } = useGetOrganizationsQuery({
    fetchPolicy: "no-cache",
    variables: { identityVerified: true },
  });
  const appInsights = useAppInsightsContext();
  const [addUser] = useAddUserMutation();
  const trackSaveSettings = useTrackEvent(appInsights, "Save Settings", null);

  if (loading) {
    return <LoadingCard message={"Loading Organizations"} />;
  }
  if (error) {
    throw error;
  }

  if (data === undefined) {
    return <p>Error: could not get organizations</p>;
  }

  const saveOrganizationAdmin = (
    organizationExternalId: string,
    admin: FacilityAdmin
  ) => {
    if (appInsights) {
      trackSaveSettings(null);
    }
    addUser({
      variables: {
        organizationExternalId: organizationExternalId,
        role: Role.Admin,
        firstName: admin.firstName,
        middleName: admin.middleName,
        lastName: admin.lastName,
        suffix: admin.suffix,
        email: admin.email,
      },
    }).then(() => {
      const alert = (
        <Alert
          type="success"
          title="Added Organization Admin"
          body="The organization admin has been added"
        />
      );
      showNotification(alert);
      setSubmitted(true);
    });
  };

  if (submitted) {
    return <Redirect to="/admin" />;
  }

  return (
    <AddOrganizationAdminForm
      organizationExternalId={""}
      admin={{
        firstName: "",
        middleName: "",
        lastName: "",
        suffix: "",
        email: "",
      }}
      organizationOptions={data.organizations}
      saveOrganizationAdmin={saveOrganizationAdmin}
    />
  );
};

export default AddOrganizationAdminFormContainer;
