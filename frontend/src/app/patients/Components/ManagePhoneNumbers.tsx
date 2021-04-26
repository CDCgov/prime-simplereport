import React, { useCallback, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { PHONE_TYPE_VALUES } from "../../constants";
import Button from "../../commonComponents/Button";
import Input from "../../commonComponents/Input";
import RadioGroup from "../../commonComponents/RadioGroup";
import {
  PhoneNumberErrors,
  allPhoneNumberErrors,
  phoneNumberUpdateSchema,
} from "../personSchema";

interface Props {
  phoneNumbers: PhoneNumber[];
  updatePhoneNumbers: (phoneNumbers: PhoneNumber[]) => void;
}

const ManagePhoneNumbers: React.FC<Props> = ({
  phoneNumbers,
  updatePhoneNumbers,
}) => {
  const [errors, setErrors] = useState<PhoneNumberErrors[]>([]);

  if (phoneNumbers.length === 0) {
    phoneNumbers = [
      {
        type: "",
        number: "",
      },
    ];
  }

  const clearError = useCallback(
    (idx: number, field: keyof PhoneNumberErrors) => {
      if (errors[idx][field]) {
        errors[idx][field] = "";

        setErrors(errors);
      }
    },
    [errors]
  );

  const validateField = useCallback(
    async (idx: number, field: keyof PhoneNumber) => {
      try {
        clearError(idx, field);
        await phoneNumberUpdateSchema.validateAt(field, phoneNumbers[idx]);
      } catch (e) {
        setErrors((existingErrors) => {
          existingErrors[idx] = {
            ...existingErrors[idx],
            [field]: allPhoneNumberErrors[field],
          };

          return existingErrors;
        });
      }
    },
    [phoneNumbers, clearError]
  );

  const validationStatus = (idx: number, name: keyof PhoneNumberErrors) => {
    return errors[idx] && errors[idx][name] ? "error" : undefined;
  };

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
          <Input
            field="number"
            label={
              idx === 0 ? "Primary phone number" : "Additional phone number"
            }
            required={true}
            formObject={phoneNumber}
            validate={(field) => validateField(idx, field)}
            getValidationStatus={() => validationStatus(idx, "number")}
            onChange={(field) => (value) => onPhoneNumberChange(idx, value)}
            errors={errors[idx] || {}}
          />
          <RadioGroup
            legend="Phone type"
            buttons={PHONE_TYPE_VALUES}
            selectedRadio={phoneNumber.type}
            required={true}
            onChange={(e) => onPhoneTypeChange(idx, e)}
          />
          {/* TODO: this isn't in the design but it feels like it should exist */}
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
