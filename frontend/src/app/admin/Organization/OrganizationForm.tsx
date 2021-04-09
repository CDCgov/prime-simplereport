import React, { useCallback, useState } from "react";

import Button from "../../commonComponents/Button";
import RequiredMessage from "../../commonComponents/RequiredMessage";
import ManageDevices from "../../Settings/Facility/Components/ManageDevices";
import OrderingProviderSettings from "../../Settings/Facility/Components/OrderingProvider";
import FacilityInformation from "../../Settings/Facility/Components/FacilityInformation";
import {
  allFacilityErrors,
  FacilityErrors,
  facilitySchema,
} from "../../Settings/Facility/facilitySchema";

import OrganizationInformation from "./OrganizationInformation";

interface Props {
  organization: Organization;
  facility: Facility;
  deviceOptions: DeviceType[];
  saveOrganization: (organization: Organization, facility: Facility) => void;
}

const OrganizationForm: React.FC<Props> = (props) => {
  const [organization, updateOrganizationFormData] = useState<Organization>(
    props.organization
  );
  const [facility, updateFacilityFormData] = useState<Facility>(props.facility);
  const [formChanged, updateFormChanged] = useState<boolean>(false);
  const updateOrgForm = (data: Organization) => {
    updateOrganizationFormData(data);
    updateFormChanged(true);
  };
  const updateForm = (data: Facility) => {
    updateFacilityFormData(data);
    updateFormChanged(true);
  };
  const updateOrganization = (newOrganization: Organization) => {
    updateOrgForm({
      ...organization,
      ...newOrganization,
    });
  };
  const updateFacility = (newFacility: Facility) => {
    updateForm({
      ...facility,
      ...newFacility,
    });
  };
  const updateProvider = (orderingProvider: Provider) => {
    updateForm({
      ...facility,
      orderingProvider,
    });
  };
  const updateDeviceTypes = (deviceTypes: string[]) => {
    updateForm({
      ...facility,
      deviceTypes,
    });
  };
  const updateDefaultDevice = (defaultDevice: string) => {
    updateForm({
      ...facility,
      defaultDevice,
    });
  };

  const [errors, setErrors] = useState<FacilityErrors>({});

  const clearError = useCallback(
    (field: keyof FacilityErrors) => {
      if (errors[field]) {
        setErrors({ ...errors, [field]: undefined });
      }
    },
    [errors]
  );

  const validateField = useCallback(
    async (field: keyof FacilityErrors) => {
      try {
        clearError(field);
        await facilitySchema.validateAt(field, facility);
      } catch (e) {
        setErrors((errors) => ({
          ...errors,
          [field]: allFacilityErrors[field],
        }));
      }
    },
    [facility, clearError]
  );

  return (
    <main className="prime-home">
      <div className="grid-container">
        <div className="grid-row">
          <div className="prime-container card-container">
            <div className="usa-card__header">
              <div>
                <h2>Create Organization</h2>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Button
                  type="button"
                  onClick={() => props.saveOrganization(organization, facility)}
                  label="Save Changes"
                  disabled={!formChanged}
                />
              </div>
            </div>
            <div className="usa-card__body">
              <RequiredMessage />
              <OrganizationInformation
                organization={organization}
                updateOrganization={updateOrganization}
              />
            </div>
            <div className="usa-card__body">
              <FacilityInformation
                facility={facility}
                updateFacility={updateFacility}
                errors={errors}
                validateField={validateField}
              />
            </div>
          </div>
          <OrderingProviderSettings
            provider={facility.orderingProvider}
            updateProvider={updateProvider}
          />
          <ManageDevices
            deviceTypes={facility.deviceTypes}
            defaultDevice={facility.defaultDevice}
            updateDeviceTypes={updateDeviceTypes}
            updateDefaultDevice={updateDefaultDevice}
            deviceOptions={props.deviceOptions}
            errors={errors}
            validateField={validateField}
          />
        </div>
      </div>
    </main>
  );
};

export default OrganizationForm;
