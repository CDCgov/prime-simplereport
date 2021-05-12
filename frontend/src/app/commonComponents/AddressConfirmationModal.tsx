import React, { ReactNode, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { formatAddress, newLineSpan } from "../utils/address";

import Alert from "./Alert";
import Button from "./Button/Button";
import RadioGroup from "./RadioGroup";
import Modal from "./Modal";
import "./AddressConfirmation.scss";

export type AddressSuggestionConfig<T> = {
  key: T;
  label?: string;
  userEnteredAddress: AddressWithMetaData;
  suggestedAddress: AddressWithMetaData | undefined;
};

interface Props<T extends string> {
  addressSuggestionConfig: AddressSuggestionConfig<T>[];
  showModal: boolean;
  onConfirm: (addresses: Record<T, AddressWithMetaData>) => void;
  onClose: () => void;
}

type addressOptions = "userAddress" | "suggested";
const ERROR_MESSAGE = "Please choose an address or go back to edit";
export const AddressConfirmationModal = <T extends string>({
  addressSuggestionConfig,
  showModal,
  onConfirm,
  onClose,
}: Props<T>) => {
  const [selectedAddress, setSelectedAddress] = useState<
    Partial<Record<T, addressOptions>>
  >({});
  const addressSuggestionConfigMap = addressSuggestionConfig.reduce(
    (acc, el) => {
      acc[el.key] = el;
      return acc;
    },
    {} as Record<T, AddressSuggestionConfig<T>>
  );

  const multipleAddresses = addressSuggestionConfig.length > 1;

  const [error, setError] = useState(new Set<T>());

  const getSelectedAddresses = () => {
    const errors = new Set<T>();
    const addresses = Object.entries(selectedAddress).reduce((acc, [k, v]) => {
      const key = k as T;
      const selection = v as addressOptions;
      if (selection === "userAddress") {
        acc[key] = addressSuggestionConfigMap[key].userEnteredAddress;
      } else if (
        selection === "suggested" &&
        addressSuggestionConfigMap[key].suggestedAddress
      ) {
        acc[key] = addressSuggestionConfigMap[key].suggestedAddress!;
      } else {
        errors.add(key);
      }
      return acc;
    }, {} as Record<T, AddressWithMetaData>);
    if (errors.size) return errors;
    return addresses;
  };

  const validate = (key: T) => {
    if (selectedAddress[key]) {
      return;
    }
    setError((e) => {
      const errors = new Set(e);
      errors.add(key);
      return errors;
    });
  };

  const onSave = () => {
    const addresses = getSelectedAddresses();
    if (addresses instanceof Set) {
      setError(addresses);
    } else {
      onConfirm(addresses);
    }
  };

  const getAlert = () => {
    if (
      addressSuggestionConfig.every(({ suggestedAddress }) => suggestedAddress)
    ) {
      return null;
    }
    return (
      <Alert
        type="warning"
        body={`The address${
          multipleAddresses ? "es" : ""
        } you entered could not be verified`}
        role="alert"
        slim
      />
    );
  };

  const getLabel = (title: string, address: AddressWithMetaData) => {
    const lastLine = address.county ? `\n ${address.county}, USA` : `\n USA`;
    return (
      <>
        <b>{title}:</b>
        <div className="address__formated usa-checkbox__label-description">
          {newLineSpan({ text: `${formatAddress(address)}${lastLine}` })}
        </div>
      </>
    );
  };

  const getSuggestedOption = (
    key: T
  ): {
    value: addressOptions;
    label: ReactNode;
    disabled?: boolean;
    className?: string;
  } => {
    if (addressSuggestionConfigMap[key].suggestedAddress) {
      return {
        value: "suggested",
        label: getLabel(
          "Use suggested address",
          addressSuggestionConfigMap[key].suggestedAddress!
        ),
      };
    }
    return {
      value: "suggested",
      label: (
        <span className="address__no-suggestion">
          No suggested address found
        </span>
      ),
      disabled: true,
      className: "radio--disabled",
    };
  };

  const onChange = (key: T, selection: addressOptions) => {
    setSelectedAddress((addresses) => ({
      ...addresses,
      [key]: selection,
    }));
    setError((e) => {
      const errors = new Set(e);
      const operation = !selection ? "add" : "delete";
      errors[operation](key);
      return errors;
    });
  };

  const closeModal = () => {
    setSelectedAddress({});
    setError(new Set());
    onClose();
  };

  return (
    <Modal onClose={closeModal} showModal={showModal}>
      <Modal.Header>Address validation</Modal.Header>
      <div className="border-top border-base-lighter margin-x-neg-205"></div>
      {getAlert()}
      {addressSuggestionConfig.map((address) => (
        <div key={address.key}>
          <p className="address__instructions">
            {address.label || "Please select an option to continue:"}
          </p>
          <RadioGroup
            name={`addressSelect-${address.key}`}
            className="address__select margin-top-0"
            buttons={[
              {
                value: "userAddress",
                label: getLabel(
                  "Use address as entered",
                  address.userEnteredAddress
                ),
              },
              getSuggestedOption(address.key),
            ]}
            selectedRadio={selectedAddress[address.key]}
            onChange={(v: addressOptions) => onChange(address.key, v)}
            onBlur={() => validate(address.key)}
            validationStatus={error.has(address.key) ? "error" : undefined}
            variant="tile"
            errorMessage={error.has(address.key) ? ERROR_MESSAGE : undefined}
          />
        </div>
      ))}
      <div className="margin-top-4">
        <div className="border-top border-base-lighter margin-bottom-2 margin-x-neg-205"></div>
        <Modal.Footer>
          <Button variant="unstyled" onClick={closeModal}>
            <FontAwesomeIcon icon={"arrow-left"} />
            <span className="margin-left-1">
              Go back to edit address{multipleAddresses ? "es" : ""}
            </span>
          </Button>
          <Button
            id="save-confirmed-address"
            onClick={onSave}
            disabled={addressSuggestionConfig.some(
              ({ key }) => !selectedAddress[key]
            )}
          >
            Save changes
          </Button>
        </Modal.Footer>
      </div>
    </Modal>
  );
};
