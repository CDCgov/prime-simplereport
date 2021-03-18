import React, { ReactNode, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { formatAddress, newLineSpan } from "../utils/address";

import Alert from "./Alert";
import Button from "./Button";
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

export const AddressConfirmationModal: React.FC<Props> = ({
  userEnteredAddress,
  suggestedAddress,
  showModal,
  onConfirm,
  onClose,
}) => {
  const [selectedAddress, setSelectedAddress] = useState<addressOptions>(
    "userAddress"
  );

  const getSelectedAddress = (): AddressWithMetaData => {
    if (selectedAddress === "userAddress") {
      return userEnteredAddress;
    } else if (selectedAddress === "suggested") {
      if (suggestedAddress === undefined) {
        throw Error("suggestedAddress was selected but it is not defined");
      }
      return suggestedAddress;
    }
    throw Error(`Unhandled address selection: ${suggestedAddress}`);
  };

  const getAlert = () => {
    if (suggestedAddress) {
      return null;
    }
    return (
      <div className="address__alert">
        <Alert
          type="warning"
          title="The address you entered could not be verified"
          role="alert"
        />
      </div>
    );
  };

  const getLabel = (title: string, address: AddressWithMetaData) => {
    const lastLine = address.county ? `\n ${address.county}, USA` : `\n USA`;
    return (
      <>
        <b>{title}:</b>
        <div className="address__formated">
          {newLineSpan({ text: `${formatAddress(address)}${lastLine}` })}
        </div>
      </>
    );
  };

  const getSuggestedOption = (): {
    value: addressOptions;
    label: ReactNode;
    disabled?: boolean;
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
        <div className="address__no-suggestion">No suggested address found</div>
      ),
      disabled: true,
    };
  };

  return (
    <Modal onClose={onClose} showModal={showModal}>
      <Modal.Header>Address Validation</Modal.Header>
      {getAlert()}
      <div className="address__instructions">
        Please select an option to continue:
      </div>
      <RadioGroup
        name="addressSelect"
        className="address__select"
        buttons={[
          {
            value: "userAddress",
            label: getLabel("Use address as entered", userEnteredAddress),
          },
          getSuggestedOption(),
        ]}
        selectedRadio={selectedAddress}
        onChange={setSelectedAddress}
      />
      <Modal.Footer>
        <Button variant="unstyled" onClick={onClose}>
          {" "}
          <FontAwesomeIcon icon={"arrow-left"} /> Go back to edit address
        </Button>
        <Button
          id="save-confirmed-address"
          onClick={() => onConfirm(getSelectedAddress())}
        >
          Save changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
