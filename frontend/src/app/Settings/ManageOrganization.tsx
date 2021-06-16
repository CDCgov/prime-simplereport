import React, { useState } from "react";

import TextInput from "../commonComponents/TextInput";
import Button from "../commonComponents/Button/Button";
import RequiredMessage from "../commonComponents/RequiredMessage";
import Alert from "../commonComponents/Alert";
import Select from "../commonComponents/Select";

import { EditableOrganization } from "./ManageOrganizationContainer";

const organizationTypes: { value: OrganizationType; label: string }[] = [
  { value: "k12", label: "K-12 School" },
  { value: "university", label: "College/University" },
  { value: "correctional_facility", label: "Correctional Facility" },
  { value: "airport", label: "Airport/Transit Station" },
  { value: "shelter", label: "Homeless Shelter" },
  { value: "fqhc", label: "FQHC" },
  { value: "primary_care", label: "Primary Care / Mental Health Outpatient" },
  { value: "assisted_living", label: "Assisted Living Facility" },
  { value: "hospital", label: "Hospital or Clinic" },
  { value: "urgent_care", label: "Urgent Care" },
  { value: "nursing_home", label: "Nursing Home" },
  { value: "treatment_center", label: "Substance Abuse Treatment Center" },
  { value: "hospice", label: "Hospice" },
  { value: "pharmacy", label: "Pharmacy" },
  { value: "other", label: "Other" },
];

interface Props {
  organization: EditableOrganization;
  onSave: (organization: EditableOrganization) => void;
  canEditOrganizationName: boolean;
}

const ManageOrganization: React.FC<Props> = (props) => {
  const [organization, setOrganization] = useState(props.organization);
  const [formChanged, setFormChanged] = useState(false);
  const onChange = <K extends keyof EditableOrganization>(key: K) => (
    value: EditableOrganization[K]
  ) => {
    setOrganization({ ...organization, [key]: value });
    setFormChanged(true);
  };

  return (
    <div className="grid-row position-relative">
      <div className="prime-container card-container">
        <div className="usa-card__header">
          <h2>Manage Organization</h2>
          <Button
            onClick={() => props.onSave(organization)}
            label="Save settings"
            disabled={!formChanged}
          />
        </div>
        <div className="usa-card__body">
          <RequiredMessage />
          {!props.canEditOrganizationName && (
            <Alert type="info">
              The organization name is used for reporting to public health
              departments. Please contact support if you need to change it.
            </Alert>
          )}
          <TextInput
            label="Organization name"
            name="name"
            value={organization.name}
            onChange={(e) => onChange("name")(e.target.value)}
            disabled={!props.canEditOrganizationName}
            required
          />
          <Select
            options={organizationTypes}
            label="Organization type"
            onChange={onChange("type")}
            value={organization.type}
            defaultSelect
            required
          />
        </div>
      </div>
    </div>
  );
};

export default ManageOrganization;
