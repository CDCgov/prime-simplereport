import { PhoneNumberUtil, PhoneNumberFormat } from "google-libphonenumber";
import { useState } from "react";

import Button from "../../commonComponents/Button/Button";
import {
  PendingOrganization,
  useEditPendingOrganizationMutation,
} from "../../../generated/graphql";

import { PendingOrganizationFormValues } from "./utils";
import "./PendingOrganizationsList.scss";
import ConfirmOrgVerificationModal from "./ConfirmOrgVerificationModal";

interface Props {
  organizations: PendingOrganization[];
  submitIdentityVerified: (externalId: string) => boolean;
  loading: boolean;
  verifyInProgress: boolean;
  refetch: () => void;
}

const phoneUtil = PhoneNumberUtil.getInstance();

const PendingOrganizations = ({
  organizations,
  submitIdentityVerified,
  loading,
  refetch,
  verifyInProgress,
}: Props) => {
  const [orgToVerify, setOrgToVerify] = useState<PendingOrganization | null>(
    null
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const [editOrg] = useEditPendingOrganizationMutation();

  const handleUpdateOrg = async (org: PendingOrganizationFormValues) => {
    // Return nothing if no verification is set
    if (orgToVerify === null) {
      return undefined;
    }

    setIsUpdating(true);
    let updatedOrg;
    try {
      updatedOrg = await editOrg({
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
    setIsUpdating(false);
    return updatedOrg;
  };

  const handleConfirmOrg = async (org: PendingOrganizationFormValues) => {
    if (orgToVerify === null) {
      return;
    }
    let awaitingVerification = true;
    try {
      const valuesChangedArray = [
        org.name === orgToVerify.name,
        org.adminEmail === orgToVerify.adminEmail,
        org.adminFirstName === orgToVerify.adminFirstName,
        org.adminLastName === orgToVerify.adminLastName,
        org.adminPhone === orgToVerify.adminPhone,
      ];
      const anyValueDifferent = !valuesChangedArray.every((v) => v === true);
      let externalIdToVerify = orgToVerify.externalId;
      if (anyValueDifferent) {
        // submit changed values and generate new externalId
        const newOrgData = await handleUpdateOrg(org);
        const updatedOrgExternalId = newOrgData?.data?.editPendingOrganization;
        if (
          updatedOrgExternalId === undefined ||
          updatedOrgExternalId === null
        ) {
          awaitingVerification = false;
          throw Error(`Update function in submit returned undefined or null
          external ID. Check for errors and try again`);
        }
        externalIdToVerify = updatedOrgExternalId;
      }
      submitIdentityVerified(externalIdToVerify);
    } catch (e) {
      console.error(e);
    }

    refetch();
    if (awaitingVerification) {
      console.log("nulling org to verify");
      setOrgToVerify(null);
    }
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
                  setOrgToVerify(null);
                }}
                onSubmit={handleConfirmOrg}
                onEdit={handleUpdateOrg}
                isUpdating={isUpdating}
                isVerifying={verifyInProgress}
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
