import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSelector } from "react-redux";
import { useForm } from "react-hook-form";

import Button from "../../commonComponents/Button/Button";
import Dropdown from "../../commonComponents/Dropdown";
import { RootState } from "../../store";
import TextInput from "../../commonComponents/TextInput";

import { SettingsUser, UserFacilitySetting } from "./ManageUsersContainer";
import "./ManageUsers.scss";
import UserFacilitiesSettingsForm from "./UserFacilitiesSettingsForm";
import { UpdateUser } from "./ManageUsers";
import { CreateUser, ROLE_OPTIONS } from "./CreateUserSchema";

interface Props {
  onClose: () => void;
  onSubmit: (newUserInvite: Partial<SettingsUser>) => void;
}

const CreateUserForm: React.FC<Props> = ({ onClose, onSubmit }) => {
  const facilities = useSelector<RootState, UserFacilitySetting[]>(
    (state) => state.facilities
  );

  const updateUser: UpdateUser = (key, value) => {
    if (key === "organization" || key === "permissions") {
      setValue(key, value);
    }
  };

  const onSave = async (user: CreateUser) => {
    onSubmit(user);
  };

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isDirty },
    setValue,
  } = useForm<CreateUser>({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      role: "USER",
      organization: null,
      permissions: [],
    },
  });
  const formCurrentValues = watch();
  return (
    <form className="border-0 card-container" onSubmit={handleSubmit(onSave)}>
      <div className="display-flex flex-justify">
        <h1 className="font-heading-lg margin-top-05 margin-bottom-0">
          Invite new user
        </h1>
        <button onClick={onClose} className="close-button" aria-label="Close">
          <span className="fa-layers">
            <FontAwesomeIcon icon={"circle"} size="2x" inverse />
            <FontAwesomeIcon icon={"times-circle"} size="2x" />
          </span>
        </button>
      </div>
      <div className="border-top border-base-lighter margin-x-neg-205 margin-top-205"></div>
      <div>
        <TextInput
          label="First name"
          name="firstName"
          required={true}
          value={formCurrentValues.firstName}
          registrationProps={register("firstName", {
            required: "First name is required",
          })}
          validationStatus={errors?.firstName?.type ? "error" : undefined}
          errorMessage={errors?.firstName?.message}
        />
        <div></div>
        <TextInput
          label="Last Name"
          name="lastName"
          required={true}
          value={formCurrentValues.lastName}
          registrationProps={register("lastName", {
            required: "Last name is required",
          })}
          validationStatus={errors?.lastName?.type ? "error" : undefined}
          errorMessage={errors?.lastName?.message}
        />
      </div>
      <div>
        <TextInput
          label="Email address"
          name="email"
          required={true}
          value={formCurrentValues.email}
          registrationProps={register("email", {
            required: "Email is required",
            pattern: {
              value:
                /^[a-zA-Z0-9_+&*-]+(?:\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/,
              message: "Email must be a valid email address",
            },
          })}
          validationStatus={errors?.email?.type ? "error" : undefined}
          errorMessage={errors?.email?.message}
        />
      </div>
      <div className="grid-row">
        <Dropdown
          label="Access level"
          name="role"
          required={true}
          options={ROLE_OPTIONS}
          selectedValue={formCurrentValues.role}
          className="grid-col"
          registrationProps={register("role")}
        />
      </div>
      <UserFacilitiesSettingsForm
        activeUser={formCurrentValues}
        onUpdateUser={updateUser}
        allFacilities={facilities}
        showRequired
      />
      <div className="border-top border-base-lighter margin-x-neg-205 margin-top-5 padding-top-205 text-right">
        <div className="display-flex flex-justify-end">
          <Button
            className="margin-right-2"
            onClick={onClose}
            variant="unstyled"
            label="Go back"
          />
          <Button
            className="margin-right-205"
            type={"submit"}
            label={isSubmitting ? "Sending" : "Send invite"}
            disabled={isSubmitting || !isDirty}
          />
        </div>
      </div>
    </form>
  );
};

export default CreateUserForm;
