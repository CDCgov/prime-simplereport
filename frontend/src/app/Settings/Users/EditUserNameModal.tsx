import React from "react";
import { useForm } from "react-hook-form";

import { displayFullName } from "../../utils";
import { TextInput } from "../../commonComponents/TextInput";

import { SettingsUser } from "./ManageUsersContainer";
import { BaseEditModal } from "./BaseEditModal";

import "./ManageUsers.scss";

type UserNameFormData = {
  firstName: string;
  lastName: string;
};
interface EditUserNameModalProps {
  onClose: () => void;
  onEditUserName: (
    userId: string,
    firstName: string,
    middleName: string,
    lastName: string,
    suffix: string
  ) => void;
  user: SettingsUser;
}

const EditUserNameModal: React.FC<EditUserNameModalProps> = ({
  onClose,
  onEditUserName,
  user,
}) => {
  const heading = `Edit name for ${displayFullName(
    user.firstName,
    "",
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
  } = useForm<UserNameFormData>({
    defaultValues: { firstName: user.firstName || "", lastName: user.lastName },
  });

  const formCurrentValues = watch();

  /**
   * Handle submit
   */
  const onSubmit = (formData: UserNameFormData) => {
    onEditUserName(
      user.id,
      formData.firstName,
      user.middleName || "",
      formData.lastName,
      user.suffix || ""
    );
    onClose();
  };

  /**
   * HTML
   */
  const modalContent = (
    <>
      <TextInput
        label="First name"
        name="firstName"
        value={formCurrentValues.firstName}
        required={true}
        validationStatus={errors.firstName?.type ? "error" : undefined}
        errorMessage={errors.firstName?.message}
        registrationProps={register("firstName", {
          required: "First name is required",
        })}
      />
      <TextInput
        label="Last name"
        name="lastName"
        value={formCurrentValues.lastName}
        required={true}
        validationStatus={errors.lastName?.type ? "error" : undefined}
        errorMessage={errors.lastName?.message}
        registrationProps={register("lastName", {
          required: "Last name is required",
        })}
      />
    </>
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

export default EditUserNameModal;
