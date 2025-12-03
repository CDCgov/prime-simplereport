import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSelector } from "react-redux";
import { useForm, FieldError } from "react-hook-form";

import Button from "../../commonComponents/Button/Button";
import Dropdown from "../../commonComponents/Dropdown";
import { RootState } from "../../store";
import TextInput from "../../commonComponents/TextInput";
import { UserPermission } from "../../../generated/graphql";
import { emailRegex } from "../../utils/email";

import { SettingsUser, UserFacilitySetting } from "./ManageUsersContainer";
import "./ManageUsers.scss";
import { CreateUser, ROLE_OPTIONS } from "./CreateUserSchema";
import UserFacilitiesSettings from "./UserFacilitiesSettings";

interface CreateUserFormProps {
  onClose: () => void;
  onSubmit: (newUserInvite: Partial<SettingsUser>) => void;
  isUpdating: boolean;
}

const CreateUserForm: React.FC<CreateUserFormProps> = ({
  onClose,
  onSubmit,
  isUpdating,
}) => {
  const facilities = useSelector<RootState, UserFacilitySetting[]>(
    (state) => state.facilities
  );

  let facilitiesMap = facilities.reduce(
    (map: { [id: string]: UserFacilitySetting }, facility) => {
      map[facility.id] = facility;
      return map;
    },
    {}
  );

  const onSave = async (user: CreateUser) => {
    const permissions: UserPermission[] = [];
    let organization: {
      testingFacility: UserFacilitySetting[];
    };
    if (user.role === "ADMIN") {
      organization = {
        testingFacility: Object.values(facilitiesMap),
      };
      permissions.push(UserPermission.AccessAllFacilities);
    } else {
      organization = {
        testingFacility: user.facilityIds
          .map((id) => facilitiesMap[id])
          .filter((userFacilitySetting) => userFacilitySetting !== undefined),
      };
      if (user.facilityIds.includes("ALL_FACILITIES")) {
        permissions.push(UserPermission.AccessAllFacilities);
      }
    }

    onSubmit({
      ...user,
      organization,
      permissions,
    });
  };

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isDirty },
    setValue,
    clearErrors,
  } = useForm<CreateUser>({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      role: "USER",
      facilityIds: [],
    },
  });
  const formCurrentValues = watch();
  return (
    <form
      className="border-0 card-container create-user-form__org-admin"
      onSubmit={handleSubmit(onSave)}
    >
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
        <TextInput
          label="Last name"
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
            required: "Email address is required",
            pattern: {
              value: emailRegex,
              message: "Email address must be a valid email address",
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
          registrationProps={register("role", {
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
              if (e.target.value === "ADMIN") {
                setValue("facilityIds", [
                  "ALL_FACILITIES",
                  ...facilities.map((facility) => facility.id),
                ]);
                clearErrors("facilityIds");
              }
            },
          })}
        />
      </div>
      <UserFacilitiesSettings
        roleSelected={formCurrentValues.role}
        facilityList={facilities}
        register={register}
        error={errors.facilityIds as FieldError}
        setValue={setValue}
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
            label={isSubmitting || isUpdating ? "Sending" : "Send invite"}
            disabled={isSubmitting || !isDirty || isUpdating}
          />
        </div>
      </div>
    </form>
  );
};

export default CreateUserForm;
