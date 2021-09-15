import { useState } from "react";
import classnames from "classnames";

import "./PendingOrganizationsList.scss";
import Alert from "../../commonComponents/Alert";
import { showNotification } from "../../utils";
import Checkboxes from "../../commonComponents/Checkboxes";
import Button from "../../commonComponents/Button/Button";
import {
  useGetOrganizationsQuery,
  useSetOrgIdentityVerifiedMutation,
} from "../../../generated/graphql";

const PendingOrganizationsList = () => {
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
  const orgs = data?.organizations || [];
  function adjustVerifiedOrgExternalIds(externalId: string, verified: boolean) {
    const newVerifiedOrgExternalIds = new Set(verifiedOrgExternalIds);
    if (verified) {
      newVerifiedOrgExternalIds.add(externalId);
    } else {
      newVerifiedOrgExternalIds.delete(externalId);
    }
    setVerifiedOrgExternalIds(newVerifiedOrgExternalIds);
  }

  function orgRows(orgs: any) {
    if (orgs.length === 0) {
      return (
        <tr>
          <td>No results</td>
        </tr>
      );
    }

    return [...orgs].map((o) => {
      return (
        <tr key={o.id} className={classnames("sr-org-row")}>
          <th scope="row">{o.name}</th>
          <th scope="row">{o.externalId}</th>
          <td>
            <Checkboxes
              onChange={(e) =>
                adjustVerifiedOrgExternalIds(o.externalId, e.target.checked)
              }
              name="identity_verified"
              legend=""
              boxes={[
                {
                  value: "1",
                  label: "Identity Verified",
                  checked: verifiedOrgExternalIds.has(o.externalId),
                },
              ]}
            />
          </td>
        </tr>
      );
    });
  }

  const rows = orgRows(orgs);

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
    <main className="prime-home">
      <div className="grid-container">
        <div className="grid-row">
          <div className="prime-container card-container sr-pending-organizations-list">
            <div className="usa-card__header">
              <h2>Organizations Pending Identity Verification</h2>
              <div>
                <Button
                  className="sr-active-button"
                  disabled={verifiedOrgExternalIds.size === 0}
                  onClick={submitIdentityVerified}
                >
                  Save Changes
                </Button>
              </div>
            </div>
            <div className="usa-card__body">
              <table className="usa-table usa-table--borderless width-full">
                <thead>
                  <tr>
                    <th scope="col">Name</th>
                    <th scope="col">External ID</th>
                    <th scope="col">Verify Identity</th>
                  </tr>
                </thead>
                <tbody>{rows}</tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default PendingOrganizationsList;
