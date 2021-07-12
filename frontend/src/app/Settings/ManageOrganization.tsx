import React, { useState } from "react";
import { toast } from "react-toastify";

import TextInput from "../commonComponents/TextInput";
import Button from "../commonComponents/Button/Button";
import RequiredMessage from "../commonComponents/RequiredMessage";
import Alert from "../commonComponents/Alert";
import Select from "../commonComponents/Select";
import { showNotification } from "../utils";

import { EditableOrganization } from "./ManageOrganizationContainer";

const organizationTypes: { value: OrganizationType; label: string }[] = [
  { value: "k12", label: "K-12 School" },
  { value: "camp", label: "Camp" },
  { value: "university", label: "College/University" },
  { value: "correctional_facility", label: "Correctional Facility" },
  { value: "employer", label: "Employer" },
  { value: "government_agency", label: "Government Agency" },
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
  { value: "lab", label: "Lab" },
  { value: "other", label: "Other" },
];

interface Props {
  organization: EditableOrganization;
  onSave: (organization: EditableOrganization) => void;
  canEditOrganizationName: boolean;
}

const ManageOrganization: React.FC<Props> = (props) => {
  const [organization, setOrganization] = useState(props.organization);
  const [errors, setErrors] = useState<
    Partial<Record<keyof EditableOrganization, string>>
  >({});
  const [formChanged, setFormChanged] = useState(false);
  const onChange = <K extends keyof EditableOrganization>(key: K) => (
    value: EditableOrganization[K]
  ) => {
    setOrganization({ ...organization, [key]: value });
    setFormChanged(true);
  };

  const validateField = (field: keyof EditableOrganization): boolean => {
    if (field === "name") {
      if (organization[field].trim().length === 0) {
        setErrors({
          ...errors,
          [field]: "The organization's name cannot be blank",
        });
        return false;
      }
    }
    if (field === "type") {
      if (
        !organizationTypes
          .map(({ value }) => value)
          .includes(organization[field])
      ) {
        setErrors({
          ...errors,
          [field]: "An organization type must be selected",
        });
        return false;
      }
    }
    setErrors({ ...errors, [field]: undefined });
    return true;
  };

  const validateAndSave = () => {
    const validName = validateField("name");
    const validType = validateField("type");
    if (validName && validType) {
      props.onSave(organization);
    } else {
      showNotification(
        toast,
        <Alert
          type="error"
          title="Information missing"
          body={
            <ul>
              {[errors["name"], errors["type"]]
                .filter((msg) => !!msg)
                .map((msg) => (
                  <li key={msg}>{msg}</li>
                ))}
            </ul>
          }
        />
      );
    }
  };

  return (
    <div className="grid-row position-relative">
      <div className="prime-container card-container">
        <div className="usa-card__header">
          <h2>Manage Organization</h2>
          <Button
            onClick={validateAndSave}
            label="Save settings"
            disabled={!formChanged}
          />
        </div>
        <div className="usa-card__body">
          <RequiredMessage />
          {!props.canEditOrganizationName && (
            <Alert type="info">
              The organization name is used for reporting to public health
              departments. Please contact{" "}
              <a href="mailto:support@simplereport.gov">
                support@simplereport.gov
              </a>{" "}
              if you need to change it.
            </Alert>
          )}

          {props.canEditOrganizationName ? (
            <TextInput
              label="Organization name"
              name="name"
              value={organization.name}
              onChange={(e) => onChange("name")(e.target.value)}
              required
            />
          ) : (
            <div className="usa-form-group">
              <span>Organization name</span>
              <p>{organization.name}</p>
            </div>
          )}
          <Select
            name="type"
            options={organizationTypes}
            label="Organization type"
            onChange={onChange("type")}
            value={organization.type}
            defaultSelect
            onBlur={() => {
              validateField("type");
            }}
            errorMessage={errors["type"]}
            validationStatus={errors["type"] ? "error" : "success"}
            required
          />
        </div>
      </div>
    </div>
  );
};

export default ManageOrganization;
