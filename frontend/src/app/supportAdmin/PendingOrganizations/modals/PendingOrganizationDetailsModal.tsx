import React, { useEffect } from "react";
import { useForm } from "react-hook-form";

import Modal from "../../../commonComponents/Modal";
import { PendingOrganization } from "../../../../generated/graphql";
import Button from "../../../commonComponents/Button/Button";
import TextInput from "../../../commonComponents/TextInput";
import { emailRegex } from "../../../utils/email";
import { phoneNumberIsValid } from "../../../patients/personSchema";

import { PendingOrganizationDetailsModalProps } from "./modal_utils";

type FieldNames = [
  "name",
  "adminFirstName",
  "adminLastName",
  "adminPhone",
  "adminEmail"
];
const getEditBtnLabel = (isUpdating: boolean) => {
  return isUpdating ? "Updating..." : "Edit only";
};

const isError = (formError: string | undefined) => {
  return formError ? "error" : undefined;
};

const PendingOrganizationDetailsModal: React.FC<
  PendingOrganizationDetailsModalProps
> = ({
  organization,
  onUpdate,
  onClose,
  isUpdating,
  isLoading,
  isOpen,
  onVerifyOrgClick,
}) => {
  const defaultValues = {
    name: organization?.name,
    adminFirstName: organization?.adminFirstName,
    adminLastName: organization?.adminLastName,
    adminEmail: organization?.adminEmail,
    adminPhone: organization?.adminPhone,
  };

  const {
    reset,
    register,
    formState: { errors },
    watch,
    trigger,
    getValues,
    getFieldState,
    handleSubmit,
  } = useForm<PendingOrganization>({
    defaultValues,
  });

  useEffect(() => {
    if (organization) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organization]);

  const formCurrentValues = watch();
  const fieldNames: FieldNames = [
    "name",
    "adminFirstName",
    "adminLastName",
    "adminPhone",
    "adminEmail",
  ];

  const isValidForm = async () => {
    return await trigger(fieldNames, { shouldFocus: true });
  };

  const onSave = async () => {
    if (await isValidForm()) {
      const pendingOrgFormData = getValues();
      await onUpdate(pendingOrgFormData);
    }
  };

  const onVerify = async () => {
    let dirtyFields: any[] = [];
    if (await isValidForm()) {
      const pendingOrgFormData = getValues();
      fieldNames.forEach((fn) => {
        dirtyFields.push(getFieldState(fn).isDirty);
      });
      let needsUpdate = dirtyFields.includes(true);
      onVerifyOrgClick(needsUpdate, pendingOrgFormData);
    }
  };

  const isBtnDisabled = isUpdating || isLoading;

  return (
    <Modal
      showModal={isOpen}
      contentLabel="Organization details"
      title="Organization details"
      onClose={onClose}
    >
      <Modal.Header
        styleClassNames={"font-sans-lg margin-top-0 margin-bottom-205"}
      >
        Organization details
      </Modal.Header>
      <div className="border-top border-base-lighter margin-x-neg-205 margin-top-205"></div>
      <form
        className="border-0 card-container"
        onSubmit={handleSubmit(() => {})}
      >
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
      </form>
      <Modal.Footer
        styleClassNames={"display-flex flex-justify-end margin-top-205"}
      >
        <Button
          className="margin-right-205"
          onClick={onClose}
          variant="unstyled"
          label="Cancel"
        />
        <Button
          className="margin-right-205"
          variant="outline"
          onClick={onSave}
          label={getEditBtnLabel(isUpdating)}
          disabled={isBtnDisabled}
        />
        <Button
          className="margin-right-0"
          id="verify-button"
          onClick={onVerify}
          label={"Verify"}
          disabled={isBtnDisabled}
        />
      </Modal.Footer>
    </Modal>
  );
};

export default PendingOrganizationDetailsModal;
