import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import Modal from "react-modal";
import { useForm } from "react-hook-form";

import { PendingOrganization } from "../../../../generated/graphql";
import Button from "../../../commonComponents/Button/Button";
import TextInput from "../../../commonComponents/TextInput";
import { emailRegex } from "../../../utils/email";
import { phoneNumberIsValid } from "../../../patients/personSchema";

import { VerficationModalProps } from "./modal_utils";
import VerifyPendingOrganizationConfirmationModal from "./VerifyPendingOrganizationConfirmationModal";

const getEditBtnLabel = (isUpdating: boolean) => {
  return isUpdating ? "Updating..." : "Edit only";
};

const getVerifyBtnLabel = (isVerifying: boolean) => {
  return isVerifying ? "Verifying..." : "Verify";
};

const isError = (formError: string | undefined) => {
  return formError ? "error" : undefined;
};

const PendingOrganizationDetailsModal: React.FC<VerficationModalProps> = ({
  organization,
  handleUpdate,
  handleClose,
  handleVerify,
  isUpdating,
  isVerifying,
  isLoading,
}) => {
  const [verifyConfirmation, setVerifyConfirmation] = useState(false);

  const {
    register,
    formState: { errors },
    watch,
    trigger,
    getValues,
    handleSubmit,
  } = useForm<PendingOrganization>({
    defaultValues: {
      name: organization.name,
      adminFirstName: organization.adminFirstName,
      adminLastName: organization.adminLastName,
      adminEmail: organization.adminEmail,
      adminPhone: organization.adminPhone,
    },
  });
  const formCurrentValues = watch();

  const isValidForm = async () => {
    return await trigger(
      ["name", "adminFirstName", "adminLastName", "adminPhone", "adminEmail"],
      { shouldFocus: true }
    );
  };

  const onSave = async () => {
    if (await isValidForm()) {
      const pendingOrgFormData = getValues();
      await handleUpdate(pendingOrgFormData);
    }
  };

  const onVerify = async () => {
    if (await isValidForm()) {
      setVerifyConfirmation(true);
    }
  };

  const isBtnDisabled = () => {
    return isVerifying || isUpdating || isLoading;
  };

  const handleVerifyConfirm = async () => {
    const pendingOrgFormData = getValues();
    await handleVerify(pendingOrgFormData);
  };

  return verifyConfirmation ? (
    <VerifyPendingOrganizationConfirmationModal
      setVerifyConfirmation={setVerifyConfirmation}
      onVerifyConfirm={handleVerifyConfirm}
      onClose={handleClose}
      organization={formCurrentValues}
      isLoading={isLoading}
    />
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
      ariaHideApp={process.env.NODE_ENV !== "test"}
      onRequestClose={handleClose}
    >
      <form
        className="border-0 card-container"
        onSubmit={handleSubmit(() => {})}
      >
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
        <TextInput
          label="Organization name"
          name="name"
          value={formCurrentValues.name}
          validationStatus={isError(errors?.name?.type)}
          errorMessage="Organization name is required"
          required
          registrationProps={register("name", {
            required: true,
          })}
        />
        <TextInput
          label="Administrator first name"
          name="adminFirstName"
          value={formCurrentValues.adminFirstName}
          validationStatus={isError(errors?.adminFirstName?.type)}
          errorMessage="Administrator first name is required"
          required
          registrationProps={register("adminFirstName", {
            required: true,
          })}
        />
        <TextInput
          label="Administrator last name"
          name="adminLastName"
          value={formCurrentValues.adminLastName}
          validationStatus={isError(errors?.adminLastName?.type)}
          errorMessage="Administrator last name is required"
          required
          registrationProps={register("adminLastName", {
            required: true,
          })}
        />
        <TextInput
          label="Administrator email"
          name="adminEmail"
          value={formCurrentValues.adminEmail}
          validationStatus={isError(errors?.adminEmail?.type)}
          errorMessage={errors?.adminEmail?.message}
          required
          registrationProps={register("adminEmail", {
            required: "Administrator email is required",
            pattern: {
              value: emailRegex,
              message: "Administrator email is incorrectly formatted",
            },
          })}
        />
        <TextInput
          label="Administrator phone"
          name="adminPhone"
          value={formCurrentValues.adminPhone}
          validationStatus={isError(errors?.adminPhone?.type)}
          errorMessage={errors?.adminPhone?.message}
          required
          registrationProps={register("adminPhone", {
            required: "Administrator phone is required",
            validate: {
              valid: (adminPhone: string) =>
                phoneNumberIsValid(adminPhone) ||
                "Administrator phone number is invalid",
            },
          })}
        />
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
              disabled={isBtnDisabled()}
            />
            <Button
              className="margin-right-205"
              id="verify-button"
              onClick={onVerify}
              label={getVerifyBtnLabel(isVerifying)}
              disabled={isBtnDisabled()}
            />
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default PendingOrganizationDetailsModal;
