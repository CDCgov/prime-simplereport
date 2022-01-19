import "./PendingOrganizationsList.scss";
import Alert from "../../commonComponents/Alert";
import { showNotification } from "../../utils";
import {
  useGetPendingOrganizationsQuery,
  useMarkPendingOrganizationAsDeletedMutation,
  useSetOrgIdentityVerifiedMutation,
} from "../../../generated/graphql";

import PendingOrganizations from "./PendingOrganizations";

const PendingOrganizationsContainer = () => {
  const [verifyIdentity] = useSetOrgIdentityVerifiedMutation();
  const [deletePendingOrg] = useMarkPendingOrganizationAsDeletedMutation();

  const { data, refetch, loading, error } = useGetPendingOrganizationsQuery();
  if (error) {
    throw error;
  }
  const submitIdentityVerified = async (externalId: string, name: string) => {
    return Promise.resolve(
      verifyIdentity({
        variables: {
          externalId: externalId,
          verified: true,
        },
      })
    )
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
        refetch();
      })
      .catch((e) => {
        console.error(e);
        showNotification(
          <Alert type="error" title={`Identity verification failed`} body={e} />
        );
        return Promise.reject("Organization verification failed");
      });
  };
  const submitDeletion = async (
    orgExternalId: string,
    deleted: boolean,
    name: string
  ) => {
    return Promise.resolve(
      deletePendingOrg({
        variables: {
          orgExternalId: orgExternalId,
          deleted: deleted,
        },
      })
    )
      .then(() => {
        showNotification(
          <Alert
            type="success"
            title={`${name} successfully deleted`}
            body=""
          />
        );
      })
      .finally(() => {
        refetch();
      })
      .catch((e) => {
        console.error(e);
        showNotification(
          <Alert
            type="error"
            title={`Deletion process failed for ${name}`}
            body={e}
          />
        );
        return Promise.reject("Organization deletion failed");
      });
  };
  return (
    <PendingOrganizations
      organizations={data?.pendingOrganizations || []}
      submitIdentityVerified={submitIdentityVerified}
      submitDeletion={submitDeletion}
      loading={loading}
      refetch={refetch}
      showNotification={showNotification}
    />
  );
};

export default PendingOrganizationsContainer;
