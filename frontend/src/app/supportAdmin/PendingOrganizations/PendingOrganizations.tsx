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
  submitIdentityVerified: (externalId: string, name: string) => Promise<void>;
  loading: boolean;
  verifyInProgress: boolean;
  setVerfiyInProgress: (verifyInProgress: boolean) => void;
  refetch: () => void;
  showNotification: (notif: JSX.Element) => void;
}

const phoneUtil = PhoneNumberUtil.getInstance();

const PendingOrganizations = ({
  organizations,
  submitIdentityVerified,
  loading,
  refetch,
  verifyInProgress,
  setVerfiyInProgress,
  showNotification,
}: Props) => {
  const [orgToVerify, setOrgToVerify] = useState<PendingOrganization | null>(
    null
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const [editOrg] = useEditPendingOrganizationMutation();
  // should be removed once mutation for deletion of pending orgs is written
  const checkIfOrgIsUsingOldOrgSchema = (
    orgToCheck: PendingOrganization | null
  ) => {
    if (orgToCheck === null) {
      return false;
    }
    const requiredFieldNotSet =
      orgToCheck.adminEmail === null ||
      orgToCheck.adminFirstName === null ||
      orgToCheck.adminLastName === null ||
      orgToCheck.adminPhone === null;
    const createdBeforeSchemaChangeDate =
      Date.parse(orgToCheck.createdAt) < Date.parse("2021-11-02T18:16:08Z");
    return requiredFieldNotSet || createdBeforeSchemaChangeDate;
  };

  const handleUpdateOrg = async (org: PendingOrganizationFormValues) => {
    const orgUsesOldSchema = checkIfOrgIsUsingOldOrgSchema(orgToVerify);

    // Return nothing if no verification is set
    if (orgToVerify === null || orgUsesOldSchema) {
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
    try {
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
      const orgUsesOldSchema = checkIfOrgIsUsingOldOrgSchema(orgToVerify);
      if (anyValueDifferent && !orgUsesOldSchema) {
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
      submitIdentityVerified(externalIdToVerify, externalNameToVerify).then(
        () => {
          setOrgToVerify(null);
        }
      );
    } catch (e) {
      console.error(e);
    }

    refetch();
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
            Edit/Verify
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
                setOrgToVerify={setOrgToVerify}
                setVerifyInProgress={setVerfiyInProgress}
                handleConfirmOrg={handleConfirmOrg}
                handleUpdateOrg={handleUpdateOrg}
                isUpdating={isUpdating}
                orgUsingOldSchema={checkIfOrgIsUsingOldOrgSchema(orgToVerify)}
                isVerifying={verifyInProgress}
                showNotification={showNotification}
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
                    <th scope="col"></th>
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
