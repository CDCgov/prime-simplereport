import React, { useCallback, useState } from "react";
import { toast } from "react-toastify";
import { Prompt } from "react-router-dom";

import iconSprite from "../../../../node_modules/uswds/dist/img/sprite.svg";
import Button from "../../commonComponents/Button/Button";
import RequiredMessage from "../../commonComponents/RequiredMessage";
import { LinkWithQuery } from "../../commonComponents/LinkWithQuery";
import Alert from "../../commonComponents/Alert";
import { showNotification } from "../../utils";
import { stateCodes, urls } from "../../../config/constants";
import { getStateNameFromCode } from "../../utils/state";

import ManageDevices from "./Components/ManageDevices";
import OrderingProviderSettings from "./Components/OrderingProvider";
import FacilityInformation from "./Components/FacilityInformation";
import {
  allFacilityErrors,
  FacilityErrors,
  facilitySchema,
} from "./facilitySchema";

export type ValidateField = (field: keyof FacilityErrors) => Promise<void>;

export const useFacilityValidation = (facility: Facility) => {
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
        const errorMessage = createFieldError(field, facility);
        setErrors((existingErrors) => ({
          ...existingErrors,
          [field]: errorMessage,
        }));
      }
    },
    [facility, clearError]
  );

  const validateFacility = async () => {
    try {
      await facilitySchema.validate(facility, { abortEarly: false });
      return "";
    } catch (e) {
      const errors = e.inner.reduce(
        (
          acc: FacilityErrors,
          el: { path: keyof FacilityErrors; message: string }
        ) => {
          acc[el.path] = createFieldError(el.path, facility);
          return acc;
        },
        {} as FacilityErrors
      );
      setErrors(errors);
      const alert = (
        <Alert
          type="error"
          title="Form Errors"
          body="Please check the form to make sure you complete all of the required fields."
        />
      );
      showNotification(toast, alert);
      return "error";
    }
  };

  return { errors, validateField, validateFacility };
};

const createFieldError = (field: keyof FacilityErrors, facility: Facility) => {
  // The `state` field may produce two different errors: one indicating
  // that no option has been selected and the other indicating that
  // SimpleReport has not gone live in that particular state.
  if (field === "state" && stateCodes.includes(facility[field])) {
    return (
      <>
        <span>
          SimpleReport isn’t currently supported in{" "}
          {getStateNameFromCode(facility.state)}.
        </span>
        <span className="display-block margin-top-05">
          See a{" "}
          <a href={urls.FACILITY_INFO}>
            {" "}
            list of states where SimpleReport is supported
          </a>
          .
        </span>
      </>
    );
  }
  return allFacilityErrors[field];
};

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

  const { errors, validateField, validateFacility } = useFacilityValidation(
    facility
  );

  const validateAndSaveFacility = async () => {
    if ((await validateFacility()) === "error") {
      return;
    }
    props.saveFacility(facility);
  };

  return (
    <>
      <Prompt
        when={formChanged}
        message="\nYour changes are not saved yet!\n\nClick OK to delete your answers and leave, or Cancel to return and save your progress."
      />
      <div className="">
        <div className="prime-container card-container">
          <div className="usa-card__header">
            <div>
              <div className="display-flex flex-align-center">
                <svg
                  className="usa-icon text-base margin-left-neg-2px"
                  aria-hidden="true"
                  focusable="false"
                  role="img"
                >
                  <use xlinkHref={iconSprite + "#arrow_back"}></use>
                </svg>
                <LinkWithQuery
                  to={`/settings/facilities`}
                  className="margin-left-05"
                >
                  All facilities
                </LinkWithQuery>
              </div>
              <h1 className="font-heading-lg margin-y-0">{facility.name}</h1>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Button
                className="margin-right-0"
                type="button"
                onClick={validateAndSaveFacility}
                label="Save changes"
                disabled={!formChanged}
              />
            </div>
          </div>
          <div className="usa-card__body padding-top-2">
            <RequiredMessage />
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
        <div className="float-right margin-bottom-4">
          <Button
            className="margin-right-0"
            type="button"
            onClick={validateAndSaveFacility}
            label="Save changes"
            disabled={!formChanged}
          />
        </div>
      </div>
    </>
  );
};

export default FacilityForm;
