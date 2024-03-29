import { ComboBox, ComboBoxOption } from "@trussworks/react-uswds";
import { Control, useController } from "react-hook-form";
import React from "react";
import classnames from "classnames";

import Required from "../Required";
import { useGetAllOrganizationsQuery } from "../../../generated/graphql";

interface OrganizationSelectFormFieldProps {
  control?: Control<any>;
  disabled?: boolean;
  isLoadingUser: boolean;
}

const UserOrganizationFormField: React.FC<OrganizationSelectFormFieldProps> = ({
  control,
  disabled,
  isLoadingUser,
}) => {
  /**
   * Form integration
   */
  const {
    field: { onChange, value, name, ref },
    fieldState: { error },
  } = useController({
    name: "organizationId",
    control,
    rules: { required: "Organization is required" },
  });
  const describeText = (error: string | undefined) =>
    error ? `Error: ${error}` : undefined;
  const label = "Organization access";
  const comboBoxId = "org-dropdown-select";

  /**
   * Fetch organizations (on initial load)
   */
  const { data: orgResponse, loading: loadingOrgs } =
    useGetAllOrganizationsQuery();

  const orgOptions: ComboBoxOption[] =
    orgResponse?.organizations?.map((org) => ({
      value: org.id,
      label: org.name,
    })) ?? [];
  /**
   * HTML
   */
  return (
    <div
      className={classnames(
        "usa-form-group",
        "margin-bottom-5",
        error && "usa-form-group--error"
      )}
    >
      <label
        className={classnames(
          "usa-label",
          "text-bold",
          "font-heading-md",
          error && "usa-label--error"
        )}
        htmlFor={comboBoxId}
      >
        <Required label={label} />
      </label>
      {error && (
        <span className={"usa-error-message"} role={"alert"}>
          <span className="usa-sr-only">Error: </span> {error?.message}
        </span>
      )}
      {loadingOrgs || isLoadingUser ? (
        <div
          className={
            "padding-1 full-width text-italic usa-hint border border-gray-10"
          }
        >
          loading...
        </div>
      ) : (
        <ComboBox
          options={orgOptions}
          id={comboBoxId}
          defaultValue={value}
          name={name}
          onChange={onChange}
          ref={ref}
          assistiveHint={describeText(error?.message)}
          disabled={loadingOrgs || disabled}
        />
      )}
    </div>
  );
};

export default UserOrganizationFormField;
