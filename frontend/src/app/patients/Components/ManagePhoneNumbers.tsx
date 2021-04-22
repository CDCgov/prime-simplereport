import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { PHONE_TYPE_VALUES } from "../../constants";
import Button from "../../commonComponents/Button";
//import Input from "../../commonComponents/Input";
import TextInput from "../../commonComponents/TextInput";
import RadioGroup from "../../commonComponents/RadioGroup";
import { PersonErrors } from "../personSchema";

import { ValidateField } from "./PersonForm";

interface Props {
  phoneNumbers: PhoneNumber[];
  updatePhoneNumbers: (phoneNumbers: PhoneNumber[]) => void;
  errors: PersonErrors;
  validateField: ValidateField;
}

const ManagePhoneNumbers: React.FC<Props> = ({
  phoneNumbers,
  updatePhoneNumbers,
  errors,
  validateField,
}) => {
  const phoneNumberErrors: React.ReactNode[] = [];

  /* fix this */
  if (phoneNumbers.length === 0) {
    phoneNumbers = [
      {
        type: "",
        number: "",
      },
    ];
  }

  if (errors.telephone) {
    phoneNumberErrors.push(errors.telephone);
  }

  const onPhoneTypeChange = (index: number, newPhoneType: string) => {
    const newPhoneNumbers = Array.from(phoneNumbers);

    newPhoneNumbers[index]["type"] = newPhoneType;
    updatePhoneNumbers(newPhoneNumbers);
  };

  const onPhoneNumberChange = (index: number, newPhoneNumber: string) => {
    const newPhoneNumbers = Array.from(phoneNumbers);

    newPhoneNumbers[index]["number"] = newPhoneNumber;
    updatePhoneNumbers(newPhoneNumbers);
  };

  const onPhoneNumberRemove = (index: number) => {
    const newPhoneNumbers = Array.from(phoneNumbers);
    newPhoneNumbers.splice(index, 1);
    updatePhoneNumbers(newPhoneNumbers);
  };

  const onAddPhoneNumber = () => {
    const newPhoneNumbers = Array.from(phoneNumbers);
    newPhoneNumbers.push({
      type: "",
      number: "",
    });
    updatePhoneNumbers(newPhoneNumbers);
  };

  const generatePhoneNumberRows = () => {
    return phoneNumbers.map((phoneNumber, idx) => {
      return (
        <div key={idx}>
          {/*
                <Input
                  field="number"
                  label={
                    idx === 0
                      ? 'Primary phone number'
                      : 'Additional phone number'
                   }
                   required={true}
                   formObject={phoneNumber}                   
                   validate={validateField}
                   getValidationStatus={() => {}}
                   onChange={(e) => onPhoneNumberChange(idx, e)()}
                   errors
              />
              */}
          <TextInput
            label={
              idx === 0 ? "Primary phone number" : "Additional phone number"
            }
            name="number"
            value={phoneNumber.number}
            required={true}
            onChange={(e) => onPhoneNumberChange(idx, e.target.value)}
          />
          <RadioGroup
            legend="Phone type"
            buttons={PHONE_TYPE_VALUES}
            selectedRadio={phoneNumber.type}
            required={true}
            onChange={(e) => onPhoneTypeChange(idx, e)}
          />
          {/* this isn't in the design but it feels like it should exist */}
          <button
            className="usa-button--unstyled"
            onClick={() => onPhoneNumberRemove(idx)}
          >
            <FontAwesomeIcon icon={"trash"} className={"prime-red-icon"} />
          </button>
        </div>
      );
    });
  };

  return (
    <div>
      {phoneNumberErrors.length > 0 && (
        <ul className="text-bold text-secondary-vivid">
          {phoneNumberErrors.map((err, index) => (
            <li key={index}>{err}</li>
          ))}
        </ul>
      )}
      {/*<div className="usa-card__body">{renderPhoneNumbersTable()}</div>*/}
      {generatePhoneNumberRows()}
      <div className="usa-card__footer">
        <Button
          onClick={onAddPhoneNumber}
          variant="unstyled"
          label="Add another number"
          icon="plus"
        />
      </div>
    </div>
  );
};

export default ManagePhoneNumbers;
