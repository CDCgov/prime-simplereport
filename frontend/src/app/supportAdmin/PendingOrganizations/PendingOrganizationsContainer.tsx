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
  const [verifiedOrgExternalId, setVerifiedOrgExternalId] = useState<
    string | null
  >(null);
  const [verifyInProgress, setVerifyInProgress] = useState<boolean>(false);
  const [verifyIdentity] = useSetOrgIdentityVerifiedMutation();
  const { data, refetch, loading, error } = useGetPendingOrganizationsQuery();
  if (error) {
    throw error;
  }

  function setVerifiedOrganization(externalId: string, verified: boolean) {
    if (verified) {
      setVerifiedOrgExternalId(externalId);
    } else {
      setVerifiedOrgExternalId(null);
    }
  }
  const submitIdentityVerified = () => {
    if (verifiedOrgExternalId === null) {
      showNotification(
        <Alert
          type="error"
          title={"No organization external ID set. Please try again"}
          body=""
        />
      );
    } else {
      setVerifyInProgress(true);
      new Promise(() => {
        return verifyIdentity({
          variables: {
            externalId: verifiedOrgExternalId,
            verified: true,
          },
        });
      })
        .then(() => {
          showNotification(
            <Alert
              type="success"
              title={`Identity verified for organization with external ID 
              ${verifiedOrgExternalId}`}
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
      verifiedOrgExternalId={verifiedOrgExternalId}
      submitIdentityVerified={submitIdentityVerified}
      setVerifiedOrganization={setVerifiedOrganization}
      loading={loading}
      verifyInProgress={verifyInProgress}
      refetch={refetch}
    />
  );
};

export default PendingOrganizationsContainer;
