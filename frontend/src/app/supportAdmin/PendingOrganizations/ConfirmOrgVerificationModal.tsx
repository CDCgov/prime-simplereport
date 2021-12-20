import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import Modal from "react-modal";

import { PendingOrganization } from "../../../generated/graphql";
import Button from "../../commonComponents/Button/Button";
import Input from "../../commonComponents/Input";
import { isFieldValid, isFormValid } from "../../utils/yupHelpers";
import Alert from "../../commonComponents/Alert";

import {
  PendingOrganizationFormValues,
  pendingOrganizationSchema,
} from "./utils";

interface ModalProps {
  organization: PendingOrganization;
  setOrgToVerify: (organization: PendingOrganization | null) => void;
  setVerifyInProgress: (v: boolean) => void;
  handleConfirmOrg: (organization: PendingOrganizationFormValues) => void;
  handleUpdateOrg: (organization: PendingOrganizationFormValues) => void;
  showNotification: (notif: JSX.Element) => void;
  isUpdating: boolean;
  isVerifying: boolean;
  orgUsingOldSchema: boolean;
}

type PendingOrganizationErrors = Record<
  keyof PendingOrganizationFormValues,
  string
>;

const ConfirmOrgVerificationModal: React.FC<ModalProps> = ({
  organization,
  setOrgToVerify,
  setVerifyInProgress,
  handleConfirmOrg,
  handleUpdateOrg,
  showNotification,
  isUpdating,
  isVerifying,
  orgUsingOldSchema,
}) => {
  const [org, setOrg] = useState<PendingOrganizationFormValues>({
    name: organization.name,
    adminEmail: organization.adminEmail || "",
    adminFirstName: organization.adminFirstName || "",
    adminLastName: organization.adminLastName || "",
    adminPhone: organization.adminPhone || "",
  });
  const [errors, setErrors] = useState<PendingOrganizationErrors>({
    name: "",
    adminEmail: "",
    adminFirstName: "",
    adminLastName: "",
    adminPhone: "",
  });

  const validateField = async (field: keyof PendingOrganizationFormValues) => {
    setErrors(
      await isFieldValid({
        data: org,
        schema: pendingOrganizationSchema,
        errors,
        field,
      })
    );
  };

  const onClose = () => {
    setOrgToVerify(null);
    setVerifyInProgress(false);
  };

  const onSubmit = () => {
    setVerifyInProgress(true);
    handleConfirmOrg(org);
  };
  const onEdit = () => {
    handleUpdateOrg(org);
    setOrgToVerify(null);
    const updateMessage = `${org.name} details updated`;

    showNotification(<Alert type="success" title={updateMessage} body="" />);
  };

  const getValidationStatus = (field: keyof PendingOrganizationFormValues) =>
    errors[field] ? "error" : undefined;

  const onChange = (field: keyof PendingOrganization) => (
    value: PendingOrganization[typeof field]
  ) => {
    setOrg({ ...org, [field]: value });
  };

  const onSave = async () => {
    const validation = await isFormValid({
      data: org,
      schema: pendingOrganizationSchema,
    });
    if (validation.valid) {
      onEdit();
    } else {
      setErrors(validation.errors);
    }
  };

  const onVerify = async () => {
    const validation = await isFormValid({
      data: org,
      schema: pendingOrganizationSchema,
    });
    if (validation.valid) {
      onSubmit();
    } else {
      setErrors(validation.errors);
    }
  };
  const commonInputProps = {
    disabled: orgUsingOldSchema,
    formObject: org,
    onChange,
    required: true,
    validate: validateField,
    errors,
    getValidationStatus,
  };

  return (
    <Modal
      isOpen={true}
      style={{
        content: {
          maxHeight: "90vh",
          width: "40em",
          position: "initial",
        },
      }}
      overlayClassName="prime-modal-overlay display-flex flex-align-center flex-justify-center"
      contentLabel="Unsaved changes to current organization"
      ariaHideApp={process.env.NODE_ENV !== "test"}
    >
      <div className="border-0 card-container">
        <div className="display-flex flex-justify">
          <h1 className="font-heading-lg margin-top-05 margin-bottom-0">
            Organization details
          </h1>
          <button
            onClick={onClose}
            className="close-button"
            data-testid="close-modal"
            aria-label="Close"
          >
            <span className="fa-layers">
              <FontAwesomeIcon icon={"circle"} size="2x" inverse />
              <FontAwesomeIcon icon={"times-circle"} size="2x" />
            </span>
          </button>
        </div>
        <div className="border-top border-base-lighter margin-x-neg-205 margin-top-205"></div>
        {orgUsingOldSchema ? (
          <div data-testid="old-schema-explanation">
            <Alert
              type="warning"
              title={"Need to edit organization details?"}
              body="You'll need to verify identity first, then contact support@simplereport.gov to request changes to organization information."
            />
          </div>
        ) : (
          <></>
        )}
        <div>
          <Input {...commonInputProps} label="Organization name" field="name" />
          <Input
            {...commonInputProps}
            label="Administrator first name"
            field="adminFirstName"
          />
          <Input
            {...commonInputProps}
            label="Administrator last name"
            field="adminLastName"
          />
          <Input
            {...commonInputProps}
            label="Administrator email"
            field="adminEmail"
          />
          <Input
            {...commonInputProps}
            label="Administrator phone"
            field="adminPhone"
          />
        </div>
        <div className="border-top border-base-lighter margin-x-neg-205 margin-top-5 padding-top-205 text-right">
          <div className="display-flex flex-justify-end">
            <Button
              className="margin-right-2"
              onClick={onClose}
              variant="unstyled"
              label="Cancel"
            />
            <Button
              className="margin-right-2"
              variant="outline"
              onClick={onSave}
              label={isUpdating ? "Updating..." : "Update only"}
              disabled={isVerifying || isUpdating || orgUsingOldSchema}
            />
            <Button
              className="margin-right-205"
              onClick={onVerify}
              label={isVerifying ? "Verifying..." : "Verify"}
              disabled={isVerifying || isUpdating}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmOrgVerificationModal;
