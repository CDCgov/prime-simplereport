import { useState } from "react";

import "./PendingOrganizationsList.scss";
import Alert from "../../commonComponents/Alert";
import { showNotification } from "../../utils";
import {
  useGetPendingOrganizationsQuery,
  useSetOrgIdentityVerifiedMutation,
} from "../../../generated/graphql";

import PendingOrganizations from "./PendingOrganizations";

const PendingOrganizationsContainer = () => {
  const [verifyInProgress, setVerifyInProgress] = useState<boolean>(false);
  const [verifyIdentity] = useSetOrgIdentityVerifiedMutation();
  const { data, refetch, loading, error } = useGetPendingOrganizationsQuery();
  if (error) {
    throw error;
  }
  const submitIdentityVerified = (externalId: string) => {
    if (externalId === null) {
      showNotification(
        <Alert
          type="error"
          title={"No organization external ID set. Please try again"}
          body=""
        />
      );
    } else {
      setVerifyInProgress(true);
      return verifyIdentity({
        variables: {
          externalId: externalId,
          verified: true,
        },
      })
        .then(() => {
          showNotification(
            <Alert
              type="success"
              title={`Identity verified for organization with external ID 
              ${externalId}`}
              body=""
            />
          );
        })
        .finally(() => {
          refetch();
          setVerifyInProgress(false);
        });
    }
  };

  return (
    <PendingOrganizations
      organizations={data?.pendingOrganizations || []}
      submitIdentityVerified={submitIdentityVerified}
      loading={loading}
      verifyInProgress={verifyInProgress}
      refetch={refetch}
    />
  );
};

export default PendingOrganizationsContainer;
