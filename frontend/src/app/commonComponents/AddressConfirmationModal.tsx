import React,  {useState} from "react";
import Modal from "react-modal";

import iconClose from "../../../node_modules/uswds/dist/img/usa-icons/close.svg";
import { formatAddress } from "../utils/address";

import Button from "./Button";
import RadioGroup from "./RadioGroup";

interface Props {
  userEnteredAddress: Address;
  suggestedAddress: Address | undefined;
  showModal: boolean;
  onConfirm: (address: Address) => void;
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

  const [selectedAddress, setSelectedAddress] = useState(userEnteredAddress);
  const onChange = (value: addressOptions) => {
    if (value === "userAddress") {
      return setSelectedAddress(userEnteredAddress);
    } else if (value === "suggested") {
      if (suggestedAddress === undefined) {
        throw Error("suggestedAddress was selected but it is not defined")
      }
      return setSelectedAddress(suggestedAddress);
    }
    throw Error(`Unhandled address selection: ${value}`);
  }
  const getAddressSelection = () => {
    if (suggestedAddress === undefined) {
      return "The address you entered could not be validated";
    }
    return (
      <>
      <b></b>
      <div>
        <RadioGroup
          legend="Please select an option to continue"
          name="addressSelect"
          buttons={[{
            value: "userAddress",
            label: `Use address as entered: ${formatAddress(userEnteredAddress)}`
          },
          {
            value: "suggested",
            label: `Use suggested address: ${formatAddress(suggestedAddress)}`
          },
        ]}
          selectedRadio="userAddress"
          onChangeHandler={onChange}
        />
      </div>
      </>
    )
  }

  return (
    <Modal
      portalClassName="modal--basic"
      isOpen={showModal}
      onRequestClose={onClose}>
      style={{
        content: {
          position: "initial",
        },
      }}
      overlayClassName="prime-modal-overlay display-flex flex-align-center flex-justify-center"
    >
      <div className="modal__container">
        <button
          className="modal__close-button"
          style={{ cursor: "pointer" }}
          onClick={() => onClose()}
        >
          <img className="modal__close-img" src={iconClose} alt="Close" />
        </button>
        <div className="modal__content">
          <h3 className="modal__heading">Address Validation</h3>

          {getAddressSelection()}
          <Button onClick={onClose}>Go back to edit address</Button>
          <Button onClick={() => onConfirm(selectedAddress)}>Save changes</Button>
        </div>
      </div>
    </Modal>
  );
};
