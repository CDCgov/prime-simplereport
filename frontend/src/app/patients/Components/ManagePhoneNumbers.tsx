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
      const newErrors = errors.map((error, i) => {
        if (i !== idx) return error;
        return {
          ...error,
          [field]: "",
        };
      });
      setErrors(newErrors);
    },
    [errors]
  );

  const validationStatus = (idx: number, name: keyof PhoneNumberErrors) => {
    return errors[idx] && errors[idx][name] ? "error" : undefined;
  };

  const validateField = useCallback(
    async (idx: number, field: keyof PhoneNumber) => {
      console.log(`Validating field ${field} at index ${idx}`);
      try {
        clearError(idx, field);
        await phoneNumberUpdateSchema.validateAt(field, phoneNumbers[idx]);
      } catch (e) {
        setErrors((existingErrors) => {
          const newErrors = [...existingErrors];
          newErrors[idx] = {
            ...newErrors[idx],
            [field]: allPhoneNumberErrors[field],
          };

          return newErrors;
        });
      }
    },
    [phoneNumbers, clearError]
  );

  /*
  useEffect(() => {
    setErrors(errors);
  }, [errors]);
  */

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
      const isPrimary = idx === 0;

      return (
        <div key={idx}>
          <div className="display-flex">
            <Input
              field="number"
              label={
                isPrimary ? "Primary phone number" : "Additional phone number"
              }
              required={isPrimary}
              formObject={phoneNumber}
              validate={(field) => validateField(idx, field)}
              getValidationStatus={() => validationStatus(idx, "number")}
              onChange={(field) => (value) => onPhoneNumberChange(idx, value)}
              errors={errors[idx] || {}}
            />
            {!isPrimary && (
              <div className="flex-align-self-end">
                <button
                  className="usa-button--unstyled padding-105 height-5"
                  onClick={() => onPhoneNumberRemove(idx)}
                >
                  <FontAwesomeIcon icon={"trash"} className={"text-error"} />
                </button>
              </div>
            )}
          </div>
          <RadioGroup
            className="margin-top-3"
            legend="Phone type"
            buttons={PHONE_TYPE_VALUES}
            selectedRadio={phoneNumber.type}
            required={isPrimary}
            onChange={(e) => onPhoneTypeChange(idx, e)}
          />
        </div>
      );
    });
  };

  return (
    <div className="usa-form">
      {generatePhoneNumberRows()}
      <Button
        className="margin-top-2"
        onClick={onAddPhoneNumber}
        variant="unstyled"
        label="Add another number"
        icon="plus"
      />
    </div>
  );
};

export default ManagePhoneNumbers;
