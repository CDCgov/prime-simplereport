import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";

import {
  getBestSuggestion,
  getZipCodeData,
  isValidZipCodeForState,
  suggestionIsCloseEnough,
} from "../../utils/smartyStreets";
import iconSprite from "../../../../node_modules/@uswds/uswds/dist/img/sprite.svg";
import Button from "../../commonComponents/Button/Button";
import RequiredMessage from "../../commonComponents/RequiredMessage";
import { LinkWithQuery } from "../../commonComponents/LinkWithQuery";
import { showError } from "../../utils/srToast";
import {
  AddressConfirmationModal,
  AddressSuggestionConfig,
} from "../../commonComponents/AddressConfirmationModal";
import Prompt from "../../utils/Prompt";
import { formatPhoneNumberParens } from "../../utils/text";
import { FORM_ERROR_MSG, FORM_ERROR_TITLE } from "../../../config/constants";

import ManageDevices from "./Components/ManageDevices";
import OrderingProviderSettings from "./Components/OrderingProvider";
import FacilityInformation from "./Components/FacilityInformation";
import ManageTestOrder from "./Components/ManageTestOrder";
import { deviceRequiredErrMsg, facilityInfoErrMsgs } from "./constants";

export type FacilityFormData = {
  facility: {
    id?: string;
    name: string;
    phone: string;
    email: string | null;
    street: string;
    streetTwo: string | null;
    city: string | null;
    zipCode: string;
    state: string;
    cliaNumber: string;
  };
  orderingProvider: {
    firstName: string | null;
    middleName: string | null;
    lastName: string | null;
    suffix: string | null;
    NPI: string | null;
    street: string | null;
    streetTwo: string | null;
    city: string | null;
    state: string;
    zipCode: string | null;
    phone: string | null;
  };
  devices: string[];
};

type AddressOptions = "facility" | "provider";

export interface Props {
  facility: Facility;
  deviceTypes: FacilityFormDeviceType[];
  saveFacility: (facilityFormData: FacilityFormData) => void;
  newOrg?: boolean;
}

const getDefaultValues = (facility: Facility) => {
  return {
    facility: {
      name: facility.name,
      phone: facility.phone
        ? formatPhoneNumberParens(facility.phone) ?? ""
        : "",
      email: facility.email,
      street: facility.street,
      streetTwo: facility.streetTwo,
      city: facility.city,
      zipCode: facility.zipCode,
      state: facility.state,
      cliaNumber: facility.cliaNumber,
    },
    orderingProvider: {
      firstName: facility.orderingProvider.firstName,
      middleName: facility.orderingProvider.middleName,
      lastName: facility.orderingProvider.lastName,
      suffix: facility.orderingProvider.suffix,
      NPI: facility.orderingProvider.NPI,
      phone: facility.orderingProvider.phone
        ? formatPhoneNumberParens(facility.orderingProvider.phone) ?? ""
        : null,
      street: facility.orderingProvider.street,
      streetTwo: facility.orderingProvider.streetTwo,
      city: facility.orderingProvider.city,
      zipCode: facility.orderingProvider.zipCode,
      state: facility.orderingProvider.state ?? "",
    },
    devices: facility.deviceTypes.length
      ? facility.deviceTypes.map((device) => device.internalId)
      : [],
    testOrders: [],
  };
};
const FacilityForm: React.FC<Props> = (props) => {
  const facility = props.facility;
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [suggestedAddresses, setSuggestedAddresses] = useState<
    AddressSuggestionConfig<AddressOptions>[]
  >([]);
  const {
    watch,
    register,
    handleSubmit,
    setFocus,
    control,
    setValue,
    setError,
    getValues,
    getFieldState,
    clearErrors,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: getDefaultValues(facility),
  });

  const updateSelectedDevices = (selectedItems: string[]) => {
    setValue("devices", selectedItems, { shouldDirty: true });
    if (selectedItems.length === 0) {
      setError("devices", {
        type: "required",
        message: deviceRequiredErrMsg,
      });
    } else {
      clearErrors("devices");
    }
  };

  const getFacilityAddress = (f: {
    name: string;
    phone: string;
    email: string | null;
    street: string;
    streetTwo: string | null;
    city: string | null;
    zipCode: string;
    state: string;
    cliaNumber: string;
  }): AddressWithMetaData => {
    return {
      street: f.street || "",
      streetTwo: f.streetTwo,
      city: f.city,
      state: f.state || "",
      zipCode: f.zipCode || "",
      county: "",
    };
  };

  const getOrderingProviderAddress = (f: {
    firstName: string | null;
    middleName: string | null;
    lastName: string | null;
    suffix: string | null;
    NPI: string | null;
    street: string | null;
    streetTwo: string | null;
    city: string | null;
    state: string;
    zipCode: string | null;
    phone: string | null;
  }): AddressWithMetaData | undefined => {
    const addressFields: (keyof Facility["orderingProvider"])[] = [
      "street",
      "streetTwo",
      "city",
      "state",
      "zipCode",
    ];

    if (addressFields.every((el) => !f[el]?.trim())) {
      return undefined;
    }

    return {
      street: f.street || "",
      streetTwo: f.streetTwo,
      city: f.city,
      state: f.state || "",
      zipCode: f.zipCode || "",
      county: "",
    };
  };

  const validateFacilityAddresses = async () => {
    let updatedValues = getUpdatedValues();
    const originalFacilityAddress = getFacilityAddress(updatedValues.facility);
    const zipCodeData = await getZipCodeData(originalFacilityAddress.zipCode);
    const isValidZipForState = isValidZipCodeForState(
      originalFacilityAddress.state,
      zipCodeData
    );

    if (!isValidZipForState) {
      setError("facility.zipCode", {
        type: "validZipForState",
        message: facilityInfoErrMsgs.zip.stateInvalid,
      });
      setFocus("facility.zipCode", { shouldSelect: true });
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
    const originalOrderingProviderAddress = getOrderingProviderAddress(
      updatedValues.orderingProvider
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
      props.saveFacility(updatedValues);
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

  const getUpdatedValues = (
    addresses?: Partial<Record<AddressOptions, AddressWithMetaData>>
  ) => {
    const values = getValues();
    let adjustedFacility: FacilityFormData;

    if (addresses) {
      adjustedFacility = {
        facility: {
          ...values.facility,
          ...addresses.facility,
        },
        orderingProvider: {
          ...values.orderingProvider,
          ...addresses.provider,
        },
        devices: values.devices || [],
      };
    } else {
      adjustedFacility = {
        facility: {
          ...values.facility,
        },
        orderingProvider: {
          ...values.orderingProvider,
        },
        devices: values.devices || [],
      };
    }

    return adjustedFacility;
  };

  const updateAddressesAndSave = (
    addresses: Partial<Record<AddressOptions, AddressWithMetaData>>
  ) => {
    const adjustedFacility = getUpdatedValues(addresses);
    setValue("facility", adjustedFacility.facility);
    setValue("orderingProvider", adjustedFacility.orderingProvider);
    props.saveFacility(adjustedFacility);
  };

  const onSubmit = async (facilityData: FacilityFormData) => {
    const { facility, orderingProvider, devices } = facilityData;
    setValue("facility", facility);
    setValue("orderingProvider", orderingProvider);
    setValue("devices", devices);
    clearErrors();
    await validateFacilityAddresses();
  };

  const onError = () => {
    showError(FORM_ERROR_MSG, FORM_ERROR_TITLE);
  };

  const formCurrentValues = watch();

  return (
    <>
      <Prompt
        when={isDirty}
        message={
          "\nYour changes are not saved yet!\n\nClick OK to delete your answers and leave, or Cancel to return and save your progress."
        }
      />
      <form
        className="usa-form maxw-none"
        onSubmit={handleSubmit(onSubmit, onError)}
      >
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
                className="margin-right-0 margin-top-05"
                type="submit"
                label="Save changes"
                disabled={!isDirty}
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
              newOrg={props.newOrg}
              errors={errors}
              register={register}
              formCurrentValues={formCurrentValues}
              setError={setError}
              getFieldState={getFieldState}
            />
          </div>
        </div>
        <OrderingProviderSettings
          newOrg={props.newOrg}
          errors={errors}
          register={register}
          formCurrentValues={formCurrentValues}
        />
        <Controller
          render={({ field: { name, ref } }) => (
            <ManageDevices
              deviceTypes={props.deviceTypes}
              newOrg={props.newOrg}
              errors={errors}
              formCurrentValues={formCurrentValues}
              registrationProps={{
                inputTextRef: ref,
                setFocus: () => setFocus(name),
              }}
              onChange={updateSelectedDevices}
            />
          )}
          defaultValue={formCurrentValues.devices}
          name="devices"
          control={control}
          rules={{ required: deviceRequiredErrMsg }}
        />
        <ManageTestOrder />
        <div className="float-right margin-bottom-4 margin-top-1">
          <Button
            className="margin-right-0"
            type="submit"
            label="Save changes"
            disabled={!isDirty}
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
      </form>
    </>
  );
};

export default FacilityForm;
