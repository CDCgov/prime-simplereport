import { PhoneNumberUtil, PhoneNumberFormat } from "google-libphonenumber";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Button from "../../commonComponents/Button/Button";
import {
  PendingOrganization,
  useEditPendingOrganizationMutation,
} from "../../../generated/graphql";
import { showSuccess } from "../../utils/srToast";
import { useDocumentTitle } from "../../utils/hooks";
import { identityVerificationPageTitle } from "../pageTitles";

import {
  PendingOrganizationFormValues,
  EditOrgMutationResponse,
} from "./utils";
import "./PendingOrganizationsList.scss";
import ConfirmOrgVerificationModal from "./modals/ConfirmOrgVerificationModal";
import ConfirmDeleteOrgModal from "./modals/ConfirmDeleteOrgModal";

interface Props {
  organizations: PendingOrganization[];
  submitIdentityVerified: (externalId: string, name: string) => Promise<void>;
  submitDeletion: (
    externalId: string,
    deleted: boolean,
    name: string
  ) => Promise<void>;
  loading: boolean;
  refetch: () => void;
}

const phoneUtil = PhoneNumberUtil.getInstance();
const PendingOrganizations = ({
  organizations,
  submitIdentityVerified,
  submitDeletion,
  loading,
  refetch,
}: Props) => {
  useDocumentTitle(identityVerificationPageTitle);

  const [orgToVerify, setOrgToVerify] = useState<PendingOrganization | null>(
    null
  );

  const [orgToDelete, setOrgToDelete] = useState<PendingOrganization | null>(
    null
  );
  const [verifyInProgress, setVerifyInProgress] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editOrg] = useEditPendingOrganizationMutation();

  const handleUpdateOrg = async (org: PendingOrganizationFormValues) => {
    // Return nothing if no verification is set
    if (orgToVerify === null) {
      return Promise.reject();
    }
    let updatedOrg;
    try {
      setIsUpdating(true);
      const mutationResponse = await editOrg({
        variables: {
          externalId: orgToVerify.externalId,
          name: org.name,
          adminFirstName: org.adminFirstName,
          adminLastName: org.adminLastName,
          adminEmail: org.adminEmail,
          adminPhone: org.adminPhone,
        },
      });
      updatedOrg = mutationResponse as EditOrgMutationResponse;
    } catch (e: any) {
      console.error(e);
      return Promise.reject();
    }
    refetch();
    setIsUpdating(false);
    setOrgToVerify(null);
    const updateMessage = `${org.name} details updated`;
    showSuccess("", updateMessage);
    return Promise.resolve(updatedOrg);
  };

  const handleConfirmOrg = async (org: PendingOrganizationFormValues) => {
    if (orgToVerify === null) {
      return Promise.reject();
    }
    try {
      setVerifyInProgress(true);
      // check to see if there are changes, verifying different type of
      // empty states
      let externalIdToVerify = orgToVerify.externalId;
      let externalNameToVerify = orgToVerify.name;

      let k: keyof typeof org;
      let anyValueDifferent = false;
      for (k in org) {
        const orgField = org[k] === "" ? null : org[k];
        const verifyField = orgToVerify[k];
        if (orgField !== verifyField) {
          anyValueDifferent = true;
          break;
        }
      }

      if (anyValueDifferent) {
        // submit changed values and generate new externalId
        const newOrgData = await handleUpdateOrg(org);
        const updatedOrgExternalId = newOrgData?.data?.editPendingOrganization;
        if (
          updatedOrgExternalId === undefined ||
          updatedOrgExternalId === null
        ) {
          throw Error(`Update function in submit returned undefined or null
          external ID. Check for errors and try again`);
        }
        externalIdToVerify = updatedOrgExternalId;
        externalNameToVerify = org.name;
      }
      await submitIdentityVerified(externalIdToVerify, externalNameToVerify);
    } catch (e: any) {
      console.error(e);
      return Promise.reject();
    }
    setVerifyInProgress(false);
    setOrgToVerify(null);
    refetch();

    return Promise.resolve();
  };

  const handleClose = () => {
    setOrgToVerify(null);
    setOrgToDelete(null);
    setVerifyInProgress(false);
  };

  const handleDeletionOrg = async (o: PendingOrganization) => {
    try {
      setIsUpdating(true);
      await submitDeletion(o.externalId, true, o.name);
      setIsUpdating(false);
      setOrgToDelete(null);
    } catch (e) {
      console.log(e);
      setIsUpdating(false);
      setOrgToDelete(null);
      return Promise.reject();
    }
    return Promise.resolve();
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
          <td colSpan={7}>No results</td>
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
        <td className="verify-button-container">
          <Button
            className="sr-pending-org-edit-verify"
            ariaLabel={`Edit or verify ${o.name}`}
            onClick={() => {
              setOrgToVerify(o);
            }}
          >
            Edit/Verify
          </Button>
        </td>
        <td>
          <button
            className="sr-pending-org-delete-button"
            aria-label={`Delete ${o.name}`}
            data-testid="delete-org-button"
            onClick={() => {
              setOrgToDelete(o);
            }}
          >
            <FontAwesomeIcon icon={"trash"} size="2x" />
          </button>
        </td>
      </tr>
    ));
  };
  return (
    <div className="prime-home flex-1">
      <div className="grid-container pending-orgs-wide-container">
        <div className="grid-row">
          <div className="prime-container card-container sr-pending-organizations-list">
            {orgToVerify ? (
              <ConfirmOrgVerificationModal
                organization={orgToVerify}
                handleVerify={handleConfirmOrg}
                handleUpdate={handleUpdateOrg}
                handleClose={handleClose}
                isUpdating={isUpdating}
                isVerifying={verifyInProgress}
              />
            ) : null}
            {orgToDelete ? (
              <ConfirmDeleteOrgModal
                organization={orgToDelete}
                handleClose={handleClose}
                handleDelete={handleDeletionOrg}
                isUpdating={isUpdating}
              />
            ) : null}
            <div className="usa-card__header">
              <h1
                data-cy="pending-orgs-title"
                className="font-heading-lg margin-top-0 margin-bottom-0"
              >
                {identityVerificationPageTitle}
              </h1>
            </div>
            <div className="usa-card__body">
              <table className="usa-table usa-table--borderless width-full">
                <thead>
                  <tr>
                    <th scope="col">Organization name</th>
                    <th scope="col">Administrator</th>
                    <th scope="col">Contact information</th>
                    <th scope="col">Created</th>
                    <th scope="col">External ID</th>
                    <th scope="col" aria-hidden></th>
                    <th scope="col" aria-hidden></th>
                  </tr>
                </thead>
                <tbody aria-live={"polite"}>{orgRows()}</tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingOrganizations;
