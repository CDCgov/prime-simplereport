import { PhoneNumberUtil, PhoneNumberFormat } from "google-libphonenumber";
import { useState } from "react";

import Button from "../../commonComponents/Button/Button";
import {
  PendingOrganization,
  useEditPendingOrganizationMutation,
} from "../../../generated/graphql";

import { PendingOrganizationFormValues } from "./utils";
import "./PendingOrganizationsList.scss";
import ConfirmOrgVerificationModal from "./modals/ConfirmOrgVerificationModal";

interface Props {
  organizations: PendingOrganization[];
  verifiedOrgExternalId: string | null;
  submitIdentityVerified: () => void;
  setVerifiedOrganization: (externalId: string, verified: boolean) => void;
  loading: boolean;
  verifyInProgress: boolean;
  refetch: () => void;
}

const phoneUtil = PhoneNumberUtil.getInstance();

const PendingOrganizations = ({
  organizations,
  submitIdentityVerified,
  setVerifiedOrganization,
  loading,
  refetch,
}: Props) => {
  const [orgToVerify, setOrgToVerify] = useState<PendingOrganization | null>(
    null
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const [editOrg] = useEditPendingOrganizationMutation();

  const handleUpdateOrg = async (org: PendingOrganizationFormValues) => {
    // Don't do anything if no org is selected
    if (orgToVerify === null) {
      return;
    }

    setIsUpdating(true);
    try {
      await editOrg({
        variables: {
          externalId: orgToVerify.externalId,
          name: org.name,
          adminFirstName: org.adminFirstName,
          adminLastName: org.adminLastName,
          adminEmail: org.adminEmail,
          adminPhone: org.adminPhone,
        },
      });
    } catch (e) {
      console.error(e);
    }

    refetch();
    setVerifiedOrganization(orgToVerify.externalId, false);
    setOrgToVerify(null);
    setIsUpdating(false);
  };

  const handleConfirmOrg = async (org: PendingOrganizationFormValues) => {
    if (orgToVerify === null) {
      return;
    }
    setIsUpdating(true);

    try {
      // resubmit form data in case there are any changes
      await handleUpdateOrg(org).then(() => {
        console.log(orgToVerify);
        console.log(org);
        // submitIdentityVerified();
        // setVerifiedOrganization(orgToVerify.externalId, false);
      });
    } catch (e) {
      console.error(e);
    }
    refetch();
    setOrgToVerify(null);
    setIsUpdating(false);
  };

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

    const orgsSortedByNewest = [...organizations].sort(
      (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)
    );

    return orgsSortedByNewest.map((o) => (
      <tr key={o.externalId} className="sr-org-row">
        <td>{o.name}</td>
        <td>{`${o.adminFirstName} ${o.adminLastName}`}</td>
        <td>
          <a href={`mailto:${o.adminEmail}}`}>{o.adminEmail}</a>
          <br />
          {o.adminPhone
            ? phoneUtil.format(
                phoneUtil.parseAndKeepRawInput(o.adminPhone, "US"),
                PhoneNumberFormat.NATIONAL
              )
            : ""}
        </td>
        <td data-testid="org-created-at-table-cell">
          {new Date(o.createdAt).toLocaleString()}
        </td>
        <td>{o.externalId}</td>
        <td>
          <Button
            className="sr-active-button"
            onClick={() => {
              setVerifiedOrganization(o.externalId, true);
              setOrgToVerify(o);
            }}
          >
            View details
          </Button>
        </td>
      </tr>
    ));
  };
  return (
    <main className="prime-home">
      <div className="grid-container pending-orgs-wide-container">
        <div className="grid-row">
          <div className="prime-container card-container sr-pending-organizations-list">
            {orgToVerify ? (
              <ConfirmOrgVerificationModal
                organization={orgToVerify}
                onClose={() => {
                  setVerifiedOrganization(orgToVerify.externalId, false);
                  setOrgToVerify(null);
                }}
                onSubmit={handleConfirmOrg}
                onEdit={handleUpdateOrg}
                isUpdating={isUpdating}
              />
            ) : null}
            <div className="usa-card__header">
              <h2>Edit or verify organization identity</h2>
            </div>
            <div className="usa-card__body">
              <table className="usa-table usa-table--borderless width-full">
                <thead>
                  <tr>
                    <th scope="col">Name</th>
                    <th scope="row">Administrator</th>
                    <th scope="row">Contact information</th>
                    <th scope="row">Created</th>
                    <th scope="col">External ID</th>
                    <th scope="col">Edit or verify identity</th>
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
