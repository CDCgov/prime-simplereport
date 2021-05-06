import React, { useState } from "react";

import Button from "../../commonComponents/Button/Button";
import RequiredMessage from "../../commonComponents/RequiredMessage";
import ManageDevices from "../../Settings/Facility/Components/ManageDevices";
import OrderingProviderSettings from "../../Settings/Facility/Components/OrderingProvider";
import FacilityInformation from "../../Settings/Facility/Components/FacilityInformation";
import { useFacilityValidation } from "../../Settings/Facility/FacilityForm";

import OrganizationInformation from "./OrganizationInformation";
import FacilityAdmin from "./FacilityAdmin";

interface Props {
  organization: Organization;
  facility: Facility;
  admin: FacilityAdmin;
  deviceOptions: DeviceType[];
  saveOrganization: (
    organization: Organization,
    facility: Facility,
    admin: FacilityAdmin
  ) => void;
}

const OrganizationForm: React.FC<Props> = (props) => {
  const [organization, updateOrganizationFormData] = useState<Organization>(
    props.organization
  );
  const [facility, updateFacilityFormData] = useState<Facility>(props.facility);
  const [admin, updateAdminFormData] = useState<FacilityAdmin>(props.admin);
  const [formChanged, updateFormChanged] = useState<boolean>(false);
  const updateOrgForm = (data: Organization) => {
    updateOrganizationFormData(data);
    updateFormChanged(true);
  };
  const updateForm = (data: Facility) => {
    updateFacilityFormData(data);
    updateFormChanged(true);
  };
  const updateAdminForm = (data: FacilityAdmin) => {
    updateAdminFormData(data);
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
  const updateAdmin = (newAdmin: FacilityAdmin) => {
    updateAdminForm({
      ...admin,
      ...newAdmin,
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

  const { errors, validateField, validateFacility } = useFacilityValidation(
    facility
  );

  const validateAndSaveOrganization = async () => {
    if ((await validateFacility()) === "error") {
      return;
    }
    props.saveOrganization(organization, facility, admin);
  };

  return (
    <main className="prime-home">
      <div className="grid-container">
        <div className="grid-row">
          <div className="prime-container card-container">
            <div className="usa-card__header">
              <div>
                <h2 className="font-heading-lg">Create Organization</h2>
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
                  onClick={validateAndSaveOrganization}
                  label="Save Changes"
                  disabled={!formChanged}
                />
              </div>
            </div>
            <div className="usa-card__body margin-top-1">
              <RequiredMessage />
              <OrganizationInformation
                organization={organization}
                updateOrganization={updateOrganization}
              />
            </div>
            <div className="usa-card__body margin-top-2">
              <FacilityInformation
                facility={facility}
                updateFacility={updateFacility}
                errors={errors}
                validateField={validateField}
              />
            </div>
          </div>
          <FacilityAdmin admin={admin} updateAdmin={updateAdmin} />
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
