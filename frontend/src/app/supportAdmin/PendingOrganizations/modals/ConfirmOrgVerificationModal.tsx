import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import Modal from "react-modal";

import { PendingOrganization } from "../../../../generated/graphql";
import Button from "../../../commonComponents/Button/Button";
import Input from "../../../commonComponents/Input";
import { isFieldValid, isFormValid } from "../../../utils/yupHelpers";
import {
  PendingOrganizationFormValues,
  pendingOrganizationSchema,
} from "../utils";

import {
  VerficationModalProps,
  PendingOrganizationErrors,
} from "./modal_utils";

const getEditBtnLabel = (isUpdating: boolean) => {
  return isUpdating ? "Updating..." : "Edit only";
};

const getVerifyBtnLabel = (isVerifying: boolean) => {
  return isVerifying ? "Verifying..." : "Verify";
};

const ConfirmOrgVerificationModal: React.FC<VerficationModalProps> = ({
  organization,
  handleUpdate,
  handleClose,
  handleVerify,
  isUpdating,
  isVerifying,
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
  const [verifyConfirmation, setVerifyConfirmation] = useState(false);

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

  const getValidationStatus = (field: keyof PendingOrganizationFormValues) =>
    errors[field] ? "error" : undefined;

  const onChange =
    (field: keyof PendingOrganization) =>
    (value: PendingOrganization[typeof field]) => {
      setOrg({ ...org, [field]: value });
    };

  const onSave = async () => {
    const validation = await isFormValid({
      data: org,
      schema: pendingOrganizationSchema,
    });
    if (validation.valid) {
      await handleUpdate(org);
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
      await handleVerify(org);
    } else {
      setErrors(validation.errors);
    }
  };
  const commonInputProps = {
    formObject: org,
    onChange,
    required: true,
    validate: validateField,
    errors,
    getValidationStatus,
  };

  return verifyConfirmation ? (
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
      contentLabel="Verify organization"
      onRequestClose={handleClose}
    >
      <div className="border-0 card-container">
        <div className="display-flex flex-justify">
          <h1 className="font-heading-lg margin-top-05 margin-bottom-0">
            Verify organization
          </h1>
          <button
            onClick={handleClose}
            className="close-button"
            aria-label="Close"
          >
            <span className="fa-layers">
              <FontAwesomeIcon icon={"circle"} size="2x" inverse />
              <FontAwesomeIcon icon={"times-circle"} size="2x" />
            </span>
          </button>
        </div>
        <div className="border-top border-base-lighter margin-x-neg-205 margin-top-205"></div>
        <div className="grid-row grid-gap">
          <p>
            Are you sure you want to verify <strong>{org.name}</strong>?
          </p>
          <p>
            Doing so will allow the organization to create an account and
            conduct and submit tests.
          </p>
        </div>
        <div className="border-top border-base-lighter margin-x-neg-205 margin-top-5 padding-top-205 text-right">
          <div className="display-flex flex-justify-end">
            <Button
              className="margin-right-2"
              onClick={() => setVerifyConfirmation(false)}
              variant="unstyled"
              label="No, go back"
            />
            <Button
              className="margin-right-205"
              id="verify-confirmation"
              label="Yes, I'm sure"
              onClick={onVerify}
            />
          </div>
        </div>
      </div>
    </Modal>
  ) : (
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
      ariaHideApp={import.meta.env.MODE !== "test"}
      onRequestClose={handleClose}
    >
      <div className="border-0 card-container">
        <div className="display-flex flex-justify">
          <h1 className="font-heading-lg margin-top-05 margin-bottom-0">
            Organization details
          </h1>
          <button
            onClick={handleClose}
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
              onClick={handleClose}
              variant="unstyled"
              label="Cancel"
            />
            <Button
              className="margin-right-2"
              variant="outline"
              onClick={onSave}
              label={getEditBtnLabel(isUpdating)}
              disabled={isVerifying || isUpdating}
            />
            <Button
              className="margin-right-205"
              id="verify-button"
              onClick={() => setVerifyConfirmation(true)}
              label={getVerifyBtnLabel(isVerifying)}
              disabled={isVerifying || isUpdating}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmOrgVerificationModal;
