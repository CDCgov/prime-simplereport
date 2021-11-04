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
  const [verifiedOrgExternalIds, setVerifiedOrgExternalIds] = useState<
    Set<string>
  >(new Set());
  const [verifyInProgress, setVerifyInProgress] = useState<boolean>(false);
  const [verifyIdentity] = useSetOrgIdentityVerifiedMutation();
  const { data, refetch, loading, error } = useGetPendingOrganizationsQuery();
  if (error) {
    throw error;
  }

  function setVerifiedOrganization(externalId: string, verified: boolean) {
    const newVerifiedOrgExternalIds = new Set(verifiedOrgExternalIds);
    if (verified) {
      newVerifiedOrgExternalIds.add(externalId);
    } else {
      newVerifiedOrgExternalIds.delete(externalId);
    }
    setVerifiedOrgExternalIds(newVerifiedOrgExternalIds);
  }

  const submitIdentityVerified = () => {
    setVerifyInProgress(true);
    Promise.all(
      Array.from(verifiedOrgExternalIds).map((externalId) => {
        return verifyIdentity({
          variables: {
            externalId: externalId,
            verified: true,
          },
        });
      })
    )
      .then(() => {
        showNotification(
          <Alert
            type="success"
            title={`Identity verified for ${
              verifiedOrgExternalIds.size
            } organization${verifiedOrgExternalIds.size === 1 ? "" : "s"}`}
            body=""
          />
        );
      })
      .finally(() => {
        refetch();
        setVerifyInProgress(false);
      });
  };

  return (
    <PendingOrganizations
      organizations={data?.pendingOrganizations || []}
      verifiedOrgExternalIds={verifiedOrgExternalIds}
      submitIdentityVerified={submitIdentityVerified}
      setVerifiedOrganization={setVerifiedOrganization}
      loading={loading}
      verifyInProgress={verifyInProgress}
    />
  );
};

export default PendingOrganizationsContainer;
