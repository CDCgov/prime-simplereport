import React, { useCallback, useState } from "react";

import iconSprite from "../../../../node_modules/uswds/dist/img/sprite.svg";
import Button from "../../commonComponents/Button/Button";
import RequiredMessage from "../../commonComponents/RequiredMessage";
import { LinkWithQuery } from "../../commonComponents/LinkWithQuery";
import { showError } from "../../utils/srToast";
import { stateCodes, urls } from "../../../config/constants";
import { getStateNameFromCode, requiresOrderProvider } from "../../utils/state";
import {
  getBestSuggestion,
  suggestionIsCloseEnough,
  isValidZipCodeForState,
  getZipCodeData,
} from "../../utils/smartyStreets";
import {
  AddressConfirmationModal,
  AddressSuggestionConfig,
} from "../../commonComponents/AddressConfirmationModal";
import Prompt from "../../utils/Prompt";

import ManageDevices from "./Components/ManageDevices";
import OrderingProviderSettings from "./Components/OrderingProvider";
import FacilityInformation from "./Components/FacilityInformation";
import { FacilityErrors, facilitySchema } from "./facilitySchema";

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
        await facilitySchema.validateAt(field, facility, {
          context: {
            orderingProviderIsRequired: requiresOrderProvider(facility.state),
          },
        });
      } catch (e: any) {
        const errorMessage =
          field === "state" && stateCodes.includes(facility[field])
            ? createStateError(facility.state)
            : e.errors.join(", ");
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
      await facilitySchema.validate(facility, {
        abortEarly: false,
        context: {
          orderingProviderIsRequired: requiresOrderProvider(facility.state),
        },
      });
      return "";
    } catch (e: any) {
      const errors = e.inner.reduce(
        (
          acc: FacilityErrors,
          el: { path: keyof FacilityErrors; message: string }
        ) => {
          acc[el.path] =
            el.path === "state" ? createStateError(facility.state) : el.message;
          return acc;
        },
        {} as FacilityErrors
      );
      setErrors(errors);
      showError(
        "Please check the form to make sure you complete all of the required fields.",
        "Form Errors"
      );
      let firstError = document.querySelector("[aria-invalid=true]");
      (firstError as HTMLElement)?.focus();
      return "error";
    }
  };

  return { errors, clearError, validateField, validateFacility };
};

const createStateError = (stateCode: string | number) => {
  return (
    <>
      <span>
        SimpleReport isn’t currently supported in{" "}
        {getStateNameFromCode(stateCode)}.
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
};

type AddressOptions = "facility" | "provider";

export interface Props {
  facility: Facility;
  deviceTypes: DeviceType[];
  saveFacility: (facility: Facility) => void;
  newOrg?: boolean;
}

const FacilityForm: React.FC<Props> = (props) => {
  const [facility, updateFormData] = useState<Facility>(props.facility);
  const [formChanged, updateFormChanged] = useState<boolean>(false);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [suggestedAddresses, setSuggestedAddresses] = useState<
    AddressSuggestionConfig<AddressOptions>[]
  >([]);

  const updateForm: typeof updateFormData = (data) => {
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

  const updateSelectedDevices = (deviceTypes: DeviceType[]) => {
    updateForm((facility) => ({
      ...facility,
      deviceTypes,
    }));
  };

  const { errors, clearError, validateField, validateFacility } =
    useFacilityValidation(facility);

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

    const addressFields: (keyof Facility["orderingProvider"])[] = [
      "street",
      "streetTwo",
      "city",
      "state",
      "zipCode",
    ];

    if (addressFields.every((el) => !f.orderingProvider?.[el]?.trim())) {
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

    const zipCodeData = await getZipCodeData(originalFacilityAddress.zipCode);
    const isValidZipForState = isValidZipCodeForState(
      originalFacilityAddress.state,
      zipCodeData
    );

    if (!isValidZipForState) {
      showError("Invalid ZIP code for this state", "Form Errors");
      return;
    }

    const suggestedFacilityAddress = await getBestSuggestion(
      originalFacilityAddress
    );
    const facilityCloseEnough = suggestionIsCloseEnough(
      originalFacilityAddress,
      suggestedFacilityAddress
    );
    let providerCloseEnough = true;
    let suggestedOrderingProviderAddress: AddressWithMetaData | undefined;
    const originalOrderingProviderAddress =
      getOrderingProviderAddress(facility);
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
      const suggestions: AddressSuggestionConfig<AddressOptions>[] = [];
      if (!facilityCloseEnough) {
        suggestions.push({
          key: "facility",
          label: "Please select an option for facility address to continue:",
          userEnteredAddress: originalFacilityAddress,
          suggestedAddress: suggestedFacilityAddress,
        });
      }
      if (originalOrderingProviderAddress && !providerCloseEnough) {
        suggestions.push({
          key: "provider",
          label:
            "Please select an option for ordering provider address to continue:",
          userEnteredAddress: originalOrderingProviderAddress,
          suggestedAddress: suggestedOrderingProviderAddress,
        });
      }
      setAddressModalOpen(true);
      setSuggestedAddresses(suggestions);
    }
  };

  const updateAddressesAndSave = (
    addresses: Partial<Record<AddressOptions, AddressWithMetaData>>
  ) => {
    const adjustedFacility: Facility = {
      ...facility,
      ...addresses.facility,
      orderingProvider: {
        ...facility.orderingProvider,
        ...addresses.provider,
      },
    };
    updateFormData(adjustedFacility);
    props.saveFacility(adjustedFacility);
  };

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
        message={
          "\nYour changes are not saved yet!\n\nClick OK to delete your answers and leave, or Cancel to return and save your progress."
        }
      />
      <div className="padding-bottom-2">
        <div className="prime-container card-container">
          <div className="usa-card__header">
            <div>
              <div className="display-flex flex-align-center">
                {props.newOrg ? (
                  <h2 className="margin-top-05">Welcome to SimpleReport!</h2>
                ) : (
                  <>
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
                      Back to all facilities
                    </LinkWithQuery>
                  </>
                )}
              </div>
              <h1 className="font-heading-lg margin-y-1">
                {facility.name || "Add facility"}
              </h1>
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
            {props.newOrg ? (
              <h3>To get started, add a testing facility.</h3>
            ) : null}
            <RequiredMessage />
            <FacilityInformation
              facility={facility}
              updateFacility={updateFacility}
              errors={errors}
              validateField={validateField}
              newOrg={props.newOrg}
            />
          </div>
        </div>
        <OrderingProviderSettings
          facility={facility}
          updateProvider={updateProvider}
          errors={errors}
          validateField={validateField}
          newOrg={props.newOrg}
        />
        <ManageDevices
          deviceTypes={props.deviceTypes}
          selectedDevices={facility.deviceTypes}
          updateSelectedDevices={updateSelectedDevices}
          errors={errors}
          clearError={clearError}
          newOrg={props.newOrg}
        />
        <div className="float-right margin-bottom-4 margin-top-4">
          <Button
            className="margin-right-0"
            type="button"
            onClick={validateAndSaveFacility}
            label="Save changes"
            disabled={!formChanged}
          />
        </div>
        <AddressConfirmationModal
          addressSuggestionConfig={suggestedAddresses}
          showModal={addressModalOpen}
          onConfirm={(addresses) => {
            updateAddressesAndSave(addresses);
            setAddressModalOpen(false);
          }}
          onClose={() => setAddressModalOpen(false)}
        />
      </div>
    </>
  );
};

export default FacilityForm;
