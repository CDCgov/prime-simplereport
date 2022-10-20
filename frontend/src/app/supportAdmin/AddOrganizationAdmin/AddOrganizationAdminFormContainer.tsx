import { useState } from "react";
import { Navigate } from "react-router-dom";

import { showSuccess } from "../../utils/srToast";
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
  const [addUser] = useAddUserMutation();

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
      showSuccess(
        "The organization admin has been added",
        "Added Organization Admin"
      );
      setSubmitted(true);
    });
  };

  if (submitted) {
    return <Navigate to="/admin" />;
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
