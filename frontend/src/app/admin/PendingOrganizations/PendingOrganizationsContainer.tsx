import { useState } from "react";

import "./PendingOrganizationsList.scss";
import Alert from "../../commonComponents/Alert";
import { showNotification } from "../../utils";
import {
  useGetOrganizationsQuery,
  useSetOrgIdentityVerifiedMutation,
} from "../../../generated/graphql";

import PendingOrganizations from "./PendingOrganizations";


const PendingOrganizationsContainer = () => {
  const [verifiedOrgExternalIds, setVerifiedOrgExternalIds] = useState<
    Set<string>
  >(new Set());
  const [verifyIdentity] = useSetOrgIdentityVerifiedMutation();
  const { data, refetch, loading, error } = useGetOrganizationsQuery({
    variables: {
      identityVerified: false,
    },
  });
  if (loading) {
    return <p>Loading</p>;
  }
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
        const alert = (
          <Alert
            type="success"
            title={
              "Identity verified for " +
              verifiedOrgExternalIds.size +
              " organization" +
              (verifiedOrgExternalIds.size === 1 ? "" : "s")
            }
            body=""
          />
        );
        showNotification(alert);
      })
      .finally(refetch);
  };

  return (
    <PendingOrganizations
      organizations={data?.organizations || []}
      verifiedOrgExternalIds={verifiedOrgExternalIds}
      submitIdentityVerified={submitIdentityVerified}
      setVerifiedOrganization={setVerifiedOrganization}
    />
  );
};

export default PendingOrganizationsContainer;
