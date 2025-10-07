import React from "react";
import { useForm } from "react-hook-form";

import { displayFullName } from "../../utils";
import { emailRegex } from "../../utils/email";
import { TextInput } from "../../commonComponents/TextInput";

import { SettingsUser } from "./ManageUsersContainer";
import BaseEditModal from "./BaseEditModal";

import "./ManageUsers.scss";

type EmailFormData = {
  email: string;
};
interface EditUserEmailModalProps {
  onClose: () => void;
  onEditUserEmail: (userId: string, emailAddress: string) => void;
  user: SettingsUser;
}

const EditUserEmailModal: React.FC<EditUserEmailModalProps> = ({
  onClose,
  onEditUserEmail,
  user,
}) => {
  const heading = `Edit email address for ${displayFullName(
    user.firstName,
    user.middleName,
    user.lastName
  )}`;

  /**
   * Form setup
   */
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
    watch,
  } = useForm<EmailFormData>({ defaultValues: { email: user.email } });

  const formCurrentValues = watch();

  /**
   * Handle submit
   */
  const onSubmit = (formData: EmailFormData) => {
    onEditUserEmail(user.id, formData.email);
    onClose();
  };

  /**
   * HTML
   */
  const modalContent = (
    <TextInput
      label="Email address"
      name="emailAddress"
      value={formCurrentValues.email}
      required={true}
      validationStatus={errors.email?.type ? "error" : undefined}
      errorMessage={errors.email?.message}
      registrationProps={register("email", {
        required: "Email is required",
        pattern: {
          value: emailRegex,
          message: "Invalid email address",
        },
      })}
    />
  );

  return (
    <BaseEditModal
      heading={heading}
      onClose={onClose}
      content={modalContent}
      onSubmit={handleSubmit(onSubmit)}
      submitDisabled={isSubmitting || !isDirty}
    ></BaseEditModal>
  );
};

export default EditUserEmailModal;
