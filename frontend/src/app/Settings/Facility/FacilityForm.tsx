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
import {
  getBestSuggestion,
  suggestionIsCloseEnough,
} from "../../utils/smartyStreets";
import { AddressConfirmationModal } from "../../commonComponents/AddressConfirmationModal";

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

type AddressSuggestionData = {
  field: "facility" | "orderingProvider";
  instruction: string;
  address: AddressWithMetaData;
  suggested: AddressWithMetaData | undefined;
};

interface Props {
  facility: Facility;
  deviceOptions: DeviceType[];
  saveFacility: (facility: Facility) => void;
}

const FacilityForm: React.FC<Props> = (props) => {
  const [facility, updateFormData] = useState<Facility>(props.facility);
  const [formChanged, updateFormChanged] = useState<boolean>(false);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [suggestedAddresses, setSuggestedAddresses] = useState<
    AddressSuggestionData[]
  >([]);

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

  const getFacilityAddress = (f: Nullable<Facility>): AddressWithMetaData => {
    return {
      street: f.street || "",
      streetTwo: f.streetTwo,
      city: f.city,
      state: f.state || "",
      zipCode: f.zipCode || "",
      county: "",
    };
  };

  const getOrderingProviderAddress = (
    f: Nullable<Facility>
  ): AddressWithMetaData | undefined => {
    if (!f.orderingProvider) {
      return undefined;
    }

    return {
      street: f.orderingProvider.street || "",
      streetTwo: f.orderingProvider.streetTwo,
      city: f.orderingProvider.city,
      state: f.orderingProvider.state || "",
      zipCode: f.orderingProvider.zipCode || "",
      county: "",
    };
  };

  const validateFacilityAddresses = async () => {
    const originalFacilityAddress = getFacilityAddress(facility);
    const suggestedFacilityAddress = await getBestSuggestion(
      originalFacilityAddress
    );
    const facilityCloseEnough = suggestionIsCloseEnough(
      originalFacilityAddress,
      suggestedFacilityAddress
    );
    let providerCloseEnough = true;
    let suggestedOrderingProviderAddress: AddressWithMetaData | undefined;
    const originalOrderingProviderAddress = getOrderingProviderAddress(
      facility
    );
    if (originalOrderingProviderAddress) {
      suggestedOrderingProviderAddress = await getBestSuggestion(
        originalOrderingProviderAddress
      );
      providerCloseEnough = suggestionIsCloseEnough(
        originalOrderingProviderAddress,
        suggestedOrderingProviderAddress
      );
    }

    if (facilityCloseEnough && providerCloseEnough) {
      props.saveFacility(facility);
    } else {
      const suggestions: AddressSuggestionData[] = [];
      if (!facilityCloseEnough) {
        suggestions.push({
          field: "facility",
          instruction:
            "Please select an option for facility address to continue:",
          address: originalFacilityAddress,
          suggested: suggestedFacilityAddress,
        });
      }
      if (originalOrderingProviderAddress && !providerCloseEnough) {
        suggestions.push({
          field: "orderingProvider",
          instruction:
            "Please select an option for ordering provider address to continue",
          address: originalOrderingProviderAddress,
          suggested: suggestedOrderingProviderAddress,
        });
      }
      setAddressModalOpen(true);
      setSuggestedAddresses(suggestions);
    }
  };

  const updateAddressesAndSave = (addresses: AddressWithMetaData[]) => {};

  const validateAndSaveFacility = async () => {
    if ((await validateFacility()) === "error") {
      return;
    }
    validateFacilityAddresses();
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
        <AddressConfirmationModal
          userEnteredAddresses={suggestedAddresses.map(
            ({ instruction, address, field }) => ({
              instruction,
              address,
              field,
            })
          )}
          suggestedAddresses={suggestedAddresses.map((a) => a.suggested)}
          showModal={addressModalOpen}
          onConfirm={(addresses) => {
            updateAddressesAndSave(addresses);
          }}
          onClose={() => setAddressModalOpen(false)}
        />
      </div>
    </>
  );
};

export default FacilityForm;
