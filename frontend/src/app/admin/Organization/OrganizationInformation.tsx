import React from "react";

import TextInput from "../../commonComponents/TextInput";

interface Props {
  organization: Organization;
  updateOrganization: (organization: Organization) => void;
}

const OrganizationInformation: React.FC<Props> = ({
  organization,
  updateOrganization,
}) => {
  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    updateOrganization({ ...organization, [e.target.name]: e.target.value });
  };

  return (
    <div>
      <h2 style={{ margin: 0 }}>Organization Information</h2>
      <div className="usa-form usa-form--large">
        <TextInput
          label="Testing Organization Name"
          name="name"
          value={organization.name}
          onChange={onChange}
          required
        />
        <TextInput
          label="External ID"
          name="externalId"
          value={organization.externalId}
          onChange={onChange}
          required
        />
      </div>
    </div>
  );
};

export default OrganizationInformation;
