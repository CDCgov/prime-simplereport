import { useState } from "react";
import { Navigate } from "react-router-dom";

import { showSuccess } from "../../utils/srToast";
import { LoadingCard } from "../../commonComponents/LoadingCard/LoadingCard";
import {
  useGetOrganizationsQuery,
  useSetCurrentUserTenantDataAccessOpMutation,
} from "../../../generated/graphql";
import { getAppInsights } from "../../TelemetryService";

import TenantDataAccessForm from "./TenantDataAccessForm";

const TenantDataAccessFormContainer = () => {
  const [submitted, setSubmitted] = useState(false);
  const { data, loading, error } = useGetOrganizationsQuery({
    fetchPolicy: "no-cache",
    variables: { identityVerified: true },
  });
  const appInsights = getAppInsights();
  const [setTenantDataAccess] = useSetCurrentUserTenantDataAccessOpMutation();

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
      appInsights.trackEvent({ name: "Save Settings " });
    }
    setTenantDataAccess({
      variables: {
        organizationExternalId: organizationExternalId,
        justification: justification,
      },
    }).then(() => {
      showSuccess(
        "You now have access to tenant data for the requested organization.",
        "Tenant Data Access Updated"
      );
      setSubmitted(true);
    });
  };

  if (submitted) {
    return <Navigate to="/reload-app" />;
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
