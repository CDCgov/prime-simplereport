import React, { ReactNode, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { formatAddress, newLineSpan } from "../utils/address";

import Alert from "./Alert";
import Button from "./Button/Button";
import RadioGroup from "./RadioGroup";
import Modal from "./Modal";
import "./AddressConfirmation.scss";

interface Props {
  userEnteredAddress: AddressWithMetaData;
  suggestedAddress: AddressWithMetaData | undefined;
  showModal: boolean;
  onConfirm: (address: AddressWithMetaData) => void;
  onClose: () => void;
}

type addressOptions = "userAddress" | "suggested";
const ERROR_MESSAGE = "Please choose to an address or go back to edit";
export const AddressConfirmationModal: React.FC<Props> = ({
  userEnteredAddress,
  suggestedAddress,
  showModal,
  onConfirm,
  onClose,
}) => {
  const [selectedAddress, setSelectedAddress] = useState<addressOptions>();
  const [error, setError] = useState<boolean>(false);

  const getSelectedAddress = (): AddressWithMetaData | undefined => {
    if (selectedAddress === "userAddress") {
      return userEnteredAddress;
    } else if (selectedAddress === "suggested") {
      if (suggestedAddress === undefined) {
        throw Error("suggestedAddress was selected but it is not defined");
      }
      return suggestedAddress;
    }
    return undefined;
  };

  const validate = () => {
    if (selectedAddress) {
      return;
    }
    setError(true);
  };

  const onSave = () => {
    const address = getSelectedAddress();
    address ? onConfirm(address) : setError(true);
  };

  const getAlert = () => {
    if (suggestedAddress) {
      return null;
    }
    return (
      <Alert
        type="warning"
        body="The address you entered could not be verified"
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

  const getSuggestedOption = (): {
    value: addressOptions;
    label: ReactNode;
    disabled?: boolean;
    className?: string;
  } => {
    if (suggestedAddress) {
      return {
        value: "suggested",
        label: getLabel("Use suggested address", suggestedAddress),
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

  const onChange = (selection: addressOptions) => {
    setSelectedAddress(selection);
    setError(!selection);
  };

  const closeModal = () => {
    setSelectedAddress(undefined);
    setError(false);
    onClose();
  };

  return (
    <Modal onClose={closeModal} showModal={showModal}>
      <Modal.Header>Address validation</Modal.Header>
      <div className="border-top border-base-lighter margin-x-neg-205"></div>
      {getAlert()}
      <RadioGroup
        name="addressSelect"
        className="address__select margin-top-0"
        legend="Please select an option to continue:"
        buttons={[
          {
            value: "userAddress",
            label: getLabel("Use address as entered", userEnteredAddress),
          },
          getSuggestedOption(),
        ]}
        selectedRadio={selectedAddress}
        onChange={onChange}
        onBlur={validate}
        validationStatus={error ? "error" : undefined}
        variant="tile"
        errorMessage={error ? ERROR_MESSAGE : undefined}
      />
      <div className="margin-top-4">
        <div className="border-top border-base-lighter margin-bottom-2 margin-x-neg-205"></div>
        <Modal.Footer>
          <Button variant="unstyled" onClick={closeModal}>
            <FontAwesomeIcon icon={"arrow-left"} />
            <span className="margin-left-1">Go back to edit address</span>
          </Button>
          <Button id="save-confirmed-address" onClick={onSave}>
            Save changes
          </Button>
        </Modal.Footer>
      </div>
    </Modal>
  );
};
