import "./PendingOrganizationsList.scss";
import { showSuccess } from "../../utils/srToast";
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
        showSuccess("", `Identity verified for ${name}`);
      })
      .finally(() => {
        refetch();
      })
      .catch((e) => {
        console.error(e);
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
        showSuccess("", `${name} successfully deleted`);
      })
      .finally(() => {
        refetch();
      })
      .catch((e) => {
        console.error(e);
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
    />
  );
};

export default PendingOrganizationsContainer;
