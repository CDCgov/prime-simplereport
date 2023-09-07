import React, { useRef, useState } from "react";
import { FieldError } from "react-hook-form/dist/types/errors";
import { UseFormHandleSubmit, UseFormSetValue } from "react-hook-form";

import Button from "../../commonComponents/Button/Button";
import UserFacilitiesSettings from "../../Settings/Users/UserFacilitiesSettings";
import {
  User,
  Facility,
  useGetTestResultCountByOrgLazyQuery,
} from "../../../generated/graphql";
import UserOrganizationFormField from "../../commonComponents/UserDetails/UserOrganizationFormField";
import UserRoleFormField from "../../commonComponents/UserDetails/UserRoleFormField";
import Modal from "../../commonComponents/Modal";
import { displayFullName } from "../../utils";

import { OrgAccessFormData } from "./AdminManageUser";

export interface UserAccessTabProps {
  user: User;
  onSubmit: (data: OrgAccessFormData) => Promise<void>;
  handleSubmit: UseFormHandleSubmit<OrgAccessFormData>;
  setValue: UseFormSetValue<OrgAccessFormData>;
  formValues: OrgAccessFormData;
  control: any;
  register: any;
  errors: any;
  isDirty: boolean;
  isLoadingFacilities: boolean;
  isSubmitting: boolean;
  facilityList: Pick<Facility, "id" | "name">[];
}

// ToDo check why the update method fails when sent individual facilities
const OrgAccessTab: React.FC<UserAccessTabProps> = ({
  user,
  facilityList,
  setValue,
  onSubmit,
  handleSubmit,
  control,
  formValues,
  register,
  errors,
  isDirty,
  isLoadingFacilities,
  isSubmitting,
}) => {
  const selectedRole = formValues.role;

  const fullName = displayFullName(
    user.firstName,
    user.middleName,
    user.lastName,
    true
  );
  const hasOrgChange = user.organization?.id !== formValues.organizationId;

  /**
   * Confirm and Submit
   */
  const dataRef = useRef<OrgAccessFormData | undefined>();

  const [getTestResultCount, { data }] = useGetTestResultCountByOrgLazyQuery();

  const handleConfirmationAndSubmit = async (formData: OrgAccessFormData) => {
    if (hasOrgChange) {
      const count =
        (await getTestResultCount({
          variables: { orgId: user.organization?.id as string },
          fetchPolicy: "no-cache",
        }).then((res) => res.data?.testResultsCount)) || 0;

      // if user could lose access of test results stop the submission
      // and ask for confirmation
      if (count > 0) {
        dataRef.current = { ...formData };
        setShowModal(true);
        return;
      }
    }

    await onSubmit(formData);
  };

  const handleSubmitFromModal = async () => {
    closeModal();
    if (dataRef.current) {
      await onSubmit(dataRef.current as OrgAccessFormData);
      dataRef.current = undefined;
    }
  };

  /**
   * Confirmation modal
   */
  const [showModal, setShowModal] = useState(false);
  const closeModal = () => setShowModal(false);

  const confirmationModal = (
    <Modal
      onClose={closeModal}
      title="Organization update"
      contentLabel="Confirm delete facility"
      showModal={showModal}
    >
      <Modal.Header
        styleClassNames={"font-heading-lg margin-top-0 margin-bottom-205"}
      >
        Organization update
      </Modal.Header>
      <div className="border-top border-base-lighter margin-x-neg-205"></div>

      <p className="margin-top-3">
        This update will move <span className="text-bold">{fullName}</span> to a
        different organization. The user will lose access to{" "}
        <span className="text-bold">{data?.testResultsCount}</span> test{" "}
        {data?.testResultsCount === 1 ? "result " : "results "}
        reported under it.
      </p>
      <div className="border-top border-base-lighter margin-x-neg-205"></div>
      <Modal.Footer
        styleClassNames={"display-flex flex-justify-end margin-top-205"}
      >
        <Button
          className="margin-right-205"
          variant="unstyled"
          label="No, go back"
          onClick={closeModal}
        />
        <Button
          className="margin-right-0"
          label="Yes, update access"
          onClick={handleSubmitFromModal}
        />
      </Modal.Footer>
    </Modal>
  );

  /**
   * HTML
   */
  return (
    <div
      role="tabpanel"
      aria-labelledby={"useraccess-tab"}
      className="padding-left-1"
    >
      <form
        onSubmit={handleSubmit(handleConfirmationAndSubmit)}
        className="usa-form usa-form--large manage-user-form__site-admin"
      >
        <UserOrganizationFormField control={control} disabled={isSubmitting} />
        <UserRoleFormField
          control={control}
          registrationProps={register("role", { required: "Role is required" })}
          error={errors.role}
          disabled={isSubmitting}
        />
        <UserFacilitiesSettings
          roleSelected={selectedRole}
          facilityList={facilityList || []}
          register={register}
          error={errors.facilityIds as FieldError}
          setValue={setValue}
          disabled={
            isSubmitting || isLoadingFacilities || selectedRole === "ADMIN"
          }
        />
        <Button
          className={"margin-y-4"}
          variant="outline"
          type="submit"
          label={"Save changes"}
          disabled={!isDirty || isSubmitting}
        />
        {confirmationModal}
      </form>
    </div>
  );
};

export default OrgAccessTab;
