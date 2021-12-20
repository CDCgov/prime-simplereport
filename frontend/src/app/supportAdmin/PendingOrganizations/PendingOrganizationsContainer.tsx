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
  const submitIdentityVerified = async (externalId: string, name: string) => {
    if (externalId === null) {
      showNotification(
        <Alert
          type="error"
          title={"No organization external ID set. Please try again"}
          body=""
        />
      );
      return Promise.reject("No organization external ID set");
    } else {
      return new Promise((resolve) => {
        resolve(
          verifyIdentity({
            variables: {
              externalId: externalId,
              verified: true,
            },
          })
        );
      })
        .then(() => {
          showNotification(
            <Alert
              type="success"
              title={`Identity verified for ${name}`}
              body=""
            />
          );
        })
        .finally(() => {
          setVerifyInProgress(false);
          refetch();
        })
        .catch((e) => {
          console.error(e);
          showNotification(
            <Alert
              type="error"
              title={`Identity verification failed`}
              body={e}
            />
          );
        });
    }
  };

  return (
    <PendingOrganizations
      organizations={data?.pendingOrganizations || []}
      submitIdentityVerified={submitIdentityVerified}
      loading={loading}
      setVerfiyInProgress={setVerifyInProgress}
      verifyInProgress={verifyInProgress}
      refetch={refetch}
      showNotification={showNotification}
    />
  );
};

export default PendingOrganizationsContainer;
