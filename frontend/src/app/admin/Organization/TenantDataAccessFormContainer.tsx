import React, { useState } from "react";
import { gql, useMutation, useQuery } from "@apollo/client";
import { toast } from "react-toastify";
import {
  useAppInsightsContext,
  useTrackEvent,
} from "@microsoft/applicationinsights-react-js";
import { Redirect } from "react-router-dom";

import Alert from "../../commonComponents/Alert";
import { showNotification } from "../../utils";

import { OrganizationOptions } from "./OrganizationDropDown";
import TenantDataAccessForm from "./TenantDataAccessForm";

const GET_ORGANIZATIONS_QUERY = gql`
  query GetOrganizations {
    organizations {
      externalId
      name
    }
  }
`;

const SET_TENANT_DATA_ACCESS = gql`
  mutation SetCurrentUserTenantDataAccessOp(
    $organizationExternalId: String!
    $justification: String!
  ) {
    setCurrentUserTenantDataAccess(
      organizationExternalId: $organizationExternalId
      justification: $justification
    ) {
      id
      email
      permissions
      role
      organization {
        name
        externalId
      }
    }
  }
`;

const TenantDataAccessFormContainer: any = () => {
  const [submitted, setSubmitted] = useState(false);
  const { data, loading, error } = useQuery<OrganizationOptions, {}>(
    GET_ORGANIZATIONS_QUERY,
    {
      fetchPolicy: "no-cache",
    }
  );
  const appInsights = useAppInsightsContext();
  const [setTenantDataAccess] = useMutation(SET_TENANT_DATA_ACCESS);
  const trackSaveSettings = useTrackEvent(appInsights, "Save Settings", null);

  if (loading) {
    return <p> Loading... </p>;
  }
  if (error) {
    return error;
  }

  if (data === undefined) {
    return <p>Error: could not get organizations</p>;
  }

  const saveTenantDataAccess = (
    organizationExternalId: string,
    justification: string
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
      showNotification(toast, alert);
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
