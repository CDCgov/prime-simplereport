import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Button from "../../commonComponents/Button";
import RequiredMessage from "../../commonComponents/RequiredMessage";
import ManageDevices from "./Components/ManageDevices";
import OrderingProviderSettings from "./Components/OrderingProvider";
import FacilityInformation from "./Components/FacilityInformation";

interface Props {
  facility: Facility;
  deviceOptions: DeviceType[];
  saveFacility: (facility: Facility) => void;
}

const FacilityForm: React.FC<Props> = (props) => {
  const [facility, updateFormData] = useState<Facility>(props.facility);
  const [formChanged, updateFormChanged] = useState<boolean>(false);
  const updateForm = (data: Facility) => {
    updateFormData(data);
    updateFormChanged(true);
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

  return (
    <div className="grid-row">
      <div className="prime-container usa-card__container">
        <div className="usa-card__header">
          <div>
            <FontAwesomeIcon icon={"arrow-left"} color="#888" />
            <NavLink to={`/settings/facilities`}> All facilities</NavLink>
            <h2>{facility.name}</h2>
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
              onClick={() => props.saveFacility(facility)}
              label="Save changes"
              disabled={!formChanged}
            />
          </div>
        </div>
        <div className="usa-card__body">
          <RequiredMessage />
          <FacilityInformation
            facility={facility}
            updateFacility={updateFacility}
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
      />
    </div>
  );
};

export default FacilityForm;
