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
  useGetOrganizationsQuery,
  useSetCurrentUserTenantDataAccessOpMutation,
} from "../../../generated/graphql";

import TenantDataAccessForm from "./TenantDataAccessForm";

const TenantDataAccessFormContainer = () => {
  const [submitted, setSubmitted] = useState(false);
  const { data, loading, error } = useGetOrganizationsQuery({
    fetchPolicy: "no-cache",
    variables: { identityVerified: true },
  });
  const appInsights = useAppInsightsContext();
  const [setTenantDataAccess] = useSetCurrentUserTenantDataAccessOpMutation();
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

  const saveTenantDataAccess = (
    organizationExternalId?: string,
    justification?: string
  ) => {
    if (appInsights) {
      trackSaveSettings(null);
    }
    setTenantDataAccess({
      variables: {
        organizationExternalId: organizationExternalId,
        justification: justification,
      },
    }).then(() => {
      const alert = (
        <Alert
          type="success"
          title="Tenant Data Access Updated"
          body="You now have access to tenant data for the requested organization."
        />
      );
      showNotification(alert);
      setSubmitted(true);

      // reload the page, in the future, this should just update state where appropriate
      window.location.reload();
    });
  };

  if (submitted) {
    return <Redirect to="/admin" />;
  }

  return (
    <TenantDataAccessForm
      organizationExternalId={""}
      justification={""}
      organizationOptions={data.organizations}
      saveTenantDataAccess={saveTenantDataAccess}
    />
  );
};

export default TenantDataAccessFormContainer;
