import { PhoneNumberUtil, PhoneNumberFormat } from "google-libphonenumber";
import React, { useState } from "react";
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
import PendingOrganizationDetailsModal from "./modals/PendingOrganizationDetailsModal";
import ConfirmDeleteOrgModal from "./modals/ConfirmDeleteOrgModal";
import VerifyPendingOrganizationConfirmationModal from "./modals/VerifyPendingOrganizationConfirmationModal";

interface Props {
  organizations: PendingOrganization[];
  submitIdentityVerified: (externalId: string, name: string) => Promise<void>;
  submitDeletion: (
    externalId: string,
    deleted: boolean,
    name: string
  ) => Promise<void>;
  refetch: () => void;
  loading: boolean;
  deletePendingOrgLoading: boolean;
  verifyIdentityLoading: boolean;
}

interface PendingOrganizationState {
  orgToVerify: PendingOrganization | null;
  orgToDelete: PendingOrganization | null;
  verifyOrgFormData: PendingOrganization | null;
  needsUpdate: boolean;
  openEditModal: boolean;
  openDeleteModal: boolean;
  openVerifyConfirmModal: boolean;
}

const initialState: PendingOrganizationState = {
  orgToVerify: null,
  orgToDelete: null,
  verifyOrgFormData: null,
  needsUpdate: false,
  openEditModal: false,
  openDeleteModal: false,
  openVerifyConfirmModal: false,
};

const phoneUtil = PhoneNumberUtil.getInstance();

const parsePhoneNumber = (phoneNumber: string) => {
  try {
    return phoneUtil.format(
      phoneUtil.parseAndKeepRawInput(phoneNumber, "US"),
      PhoneNumberFormat.NATIONAL
    );
  } catch {
    return "";
  }
};

const PendingOrganizations = ({
  organizations,
  submitIdentityVerified,
  submitDeletion,
  loading,
  refetch,
  deletePendingOrgLoading,
  verifyIdentityLoading,
}: Props) => {
  useDocumentTitle(identityVerificationPageTitle);
  const [localState, updateLocalState] =
    useState<PendingOrganizationState>(initialState);
  const [editOrg, { loading: editOrgLoading }] =
    useEditPendingOrganizationMutation();

  const handleDeleteOrgClick = (selectedPendingOrg: PendingOrganization) => {
    updateLocalState(() => ({
      ...initialState,
      orgToDelete: selectedPendingOrg,
      openDeleteModal: true,
    }));
  };

  const handleVerifyEditOrgClick = (
    selectedPendingOrg: PendingOrganization
  ) => {
    updateLocalState(() => ({
      ...initialState,
      orgToVerify: selectedPendingOrg,
      openEditModal: true,
    }));
  };

  const handleVerifyOrgClick = (
    needsUpdate: boolean,
    org: PendingOrganizationFormValues
  ) => {
    const pendingOrg = {
      ...localState.orgToVerify,
      name: org.name ?? localState.orgToVerify?.name,
      adminFirstName:
        org.adminFirstName ?? localState.orgToVerify?.adminFirstName,
      adminLastName: org.adminLastName ?? localState.orgToVerify?.adminLastName,
      adminEmail: org.adminEmail ?? localState.orgToVerify?.adminEmail,
      adminPhone: org.adminPhone ?? localState.orgToVerify?.adminPhone,
    };
    // @ts-ignore
    updateLocalState((prevState) => {
      return {
        ...prevState,
        orgToVerify: pendingOrg,
        needsUpdate: needsUpdate,
        openEditModal: false,
        openVerifyConfirmModal: true,
      };
    });
  };

  const handleUpdateOrg = async (org: PendingOrganizationFormValues) => {
    let updatedOrg;
    try {
      const mutationResponse = await editOrg({
        variables: {
          externalId: localState.orgToVerify?.externalId ?? "",
          name: org.name,
          adminFirstName: org.adminFirstName,
          adminLastName: org.adminLastName,
          adminEmail: org.adminEmail,
          adminPhone: org.adminPhone,
        },
      });
      updatedOrg = mutationResponse as EditOrgMutationResponse;
    } catch {
      return Promise.reject();
    }
    refetch();
    handleCloseAll();
    const updateMessage = `${org.name} details updated`;
    showSuccess("", updateMessage);
    return Promise.resolve(updatedOrg);
  };

  const handleConfirmOrg = async () => {
    try {
      let externalIdToVerify = localState.orgToVerify?.externalId ?? "";
      let externalNameToVerify = localState.orgToVerify?.name ?? "";

      // saves if form is dirty
      if (localState.needsUpdate && localState.orgToVerify) {
        // submit changed values and generate new externalId
        const newOrgData = await handleUpdateOrg(localState.orgToVerify);
        const updatedOrgExternalId = newOrgData?.data?.editPendingOrganization;
        if (
          updatedOrgExternalId === undefined ||
          updatedOrgExternalId === null
        ) {
          throw Error(`Update function in submit returned undefined or null
          external ID. Check for errors and try again`);
        }
        externalIdToVerify = updatedOrgExternalId;
      }
      await submitIdentityVerified(externalIdToVerify, externalNameToVerify);
    } catch {
      return Promise.reject();
    }
    refetch();
    handleCloseAll();
    return Promise.resolve();
  };

  const handleCloseAll = () => {
    updateLocalState(() => initialState);
  };

  const handleCloseVerifyConfirmModal = () => {
    updateLocalState((prevState) => {
      return {
        ...prevState,
        needsUpdate: false,
        openEditModal: true,
        openVerifyConfirmModal: false,
      };
    });
  };

  const handleDeletionOrg = async (o: PendingOrganization) => {
    try {
      await submitDeletion(o.externalId, true, o.name);
    } catch {
      updateLocalState(() => initialState);
      return Promise.reject();
    }
    updateLocalState(() => initialState);
    return Promise.resolve();
  };

  const orgRows = () => {
    if (loading) {
      return (
        <tr>
          <td colSpan={7}>Loading Organizations...</td>
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
        <td className="word-break-break-word">{o.name}</td>
        <td className="word-break-break-word">{`${o.adminFirstName} ${o.adminLastName}`}</td>
        <td className="word-break-break-word">
          <a href={`mailto:${o.adminEmail}}`}>{o.adminEmail}</a>
          <br />
          {parsePhoneNumber(o.adminPhone)}
        </td>
        <td
          data-testid="org-created-at-table-cell"
          className="word-break-break-word"
        >
          {new Date(o.createdAt).toLocaleString()}
        </td>
        <td className="word-break-break-word">{o.externalId}</td>
        <td>
          <Button
            className="sr-pending-org-edit-verify"
            ariaLabel={`Edit or verify ${o.name}`}
            onClick={() => {
              handleVerifyEditOrgClick(o);
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
            onClick={() => handleDeleteOrgClick(o)}
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
            <PendingOrganizationDetailsModal
              organization={localState.orgToVerify}
              onVerifyOrgClick={(
                needsUpdate: boolean,
                org: PendingOrganization
              ) => handleVerifyOrgClick(needsUpdate, org)}
              onUpdate={handleUpdateOrg}
              onClose={handleCloseAll}
              isUpdating={editOrgLoading}
              isLoading={loading}
              isOpen={localState.openEditModal}
            />
            <VerifyPendingOrganizationConfirmationModal
              onGoBackClick={handleCloseVerifyConfirmModal}
              onVerifyConfirm={handleConfirmOrg}
              onClose={handleCloseAll}
              organization={localState.orgToVerify}
              isLoading={loading}
              isUpdating={editOrgLoading}
              isVerifying={verifyIdentityLoading}
              isOpen={localState.openVerifyConfirmModal}
            />
            <ConfirmDeleteOrgModal
              organization={localState.orgToDelete}
              onClose={handleCloseAll}
              handleDelete={handleDeletionOrg}
              isDeleting={deletePendingOrgLoading}
              isLoading={loading}
              isOpen={localState.openDeleteModal}
            />
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
