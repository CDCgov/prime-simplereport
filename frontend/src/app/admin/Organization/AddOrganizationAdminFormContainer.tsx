import React, { useState } from "react";
import { gql, useMutation, useQuery } from "@apollo/client";
import {
  useAppInsightsContext,
  useTrackEvent,
} from "@microsoft/applicationinsights-react-js";
import { Redirect } from "react-router-dom";

import Alert from "../../commonComponents/Alert";
import { showNotification } from "../../utils";
import { LoadingCard } from "../../commonComponents/LoadingCard/LoadingCard";

import { OrganizationOptions } from "./OrganizationDropDown";
import AddOrganizationAdminForm from "./AddOrganizationAdminForm";
import { GET_ORGANIZATIONS_QUERY } from "./TenantDataAccessFormContainer";

const ADD_USER_MUTATION = gql`
  mutation AddUser(
    $firstName: String
    $middleName: String
    $lastName: String
    $suffix: String
    $email: String!
    $organizationExternalId: String!
    $role: Role!
  ) {
    addUser(
      name: {
        firstName: $firstName
        middleName: $middleName
        lastName: $lastName
        suffix: $suffix
      }
      email: $email
      organizationExternalId: $organizationExternalId
      role: $role
    ) {
      id
      name {
        firstName
        middleName
        lastName
        suffix
      }
      email
      role
      organization {
        name
        externalId
        facilities {
          name
          id
        }
      }
    }
  }
`;

const AddOrganizationAdminFormContainer: any = () => {
  const [submitted, setSubmitted] = useState(false);
  const { data, loading, error } = useQuery<OrganizationOptions, {}>(
    GET_ORGANIZATIONS_QUERY,
    {
      fetchPolicy: "no-cache",
      variables: { identityVerified: true },
    }
  );
  const appInsights = useAppInsightsContext();
  const [addUser] = useMutation(ADD_USER_MUTATION);
  const trackSaveSettings = useTrackEvent(appInsights, "Save Settings", null);

  if (loading) {
    return <LoadingCard message={"Loading Organizations"} />;
  }
  if (error) {
    return error;
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
        role: "ADMIN",
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
