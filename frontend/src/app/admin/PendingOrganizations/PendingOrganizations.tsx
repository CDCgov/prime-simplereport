import "./PendingOrganizationsList.scss";
import Checkboxes from "../../commonComponents/Checkboxes";
import Button from "../../commonComponents/Button/Button";

interface Props {
  organizations: {
    externalId: string;
    name: string;
  }[];
  verifiedOrgExternalIds: Set<string>;
  submitIdentityVerified: () => void;
  setVerifiedOrganization: (externalId: string, verified: boolean) => void;
  loading: boolean;
}

const PendingOrganizations = ({
  organizations,
  verifiedOrgExternalIds,
  submitIdentityVerified,
  setVerifiedOrganization,
  loading,
}: Props) => {
  const orgRows = () => {
    if (loading) {
      return (
        <tr>
          <td>Loading Organizations...</td>
        </tr>
      );
    }
    if (organizations.length === 0) {
      return (
        <tr>
          <td>No results</td>
        </tr>
      );
    }

    return [...organizations].map((o) => (
      <tr key={o.externalId} className="sr-org-row">
        <th scope="row">{o.name}</th>
        <th scope="row">{o.externalId}</th>
        <td>
          <Checkboxes
            onChange={(e) =>
              setVerifiedOrganization(o.externalId, e.target.checked)
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
    ));
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
                  disabled={loading || verifiedOrgExternalIds.size === 0}
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
                <tbody>{orgRows()}</tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default PendingOrganizations;
