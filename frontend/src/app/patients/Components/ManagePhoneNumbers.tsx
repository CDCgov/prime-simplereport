import React, { useCallback, useState, useMemo, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslation } from "react-i18next";

import Button from "../../commonComponents/Button/Button";
import Input from "../../commonComponents/Input";
import RadioGroup from "../../commonComponents/RadioGroup";
import { useTranslatedConstants } from "../../constants";
import { PhoneNumberErrors, usePersonSchemata } from "../personSchema";

import {
  TestResultDeliveryPreference,
  TestResultDeliveryPreferences,
} from "./PersonForm";

interface Props {
  phoneNumbers: PhoneNumber[];
  testResultDelivery: TestResultDeliveryPreference | null;
  updatePhoneNumbers: (phoneNumbers: PhoneNumber[]) => void;
  updateTestResultDelivery: (
    testResultDelivery: TestResultDeliveryPreference
  ) => void;
  phoneNumberValidator: React.MutableRefObject<Function | null>;
}

const ManagePhoneNumbers: React.FC<Props> = ({
  phoneNumbers,
  testResultDelivery,
  updatePhoneNumbers,
  updateTestResultDelivery,
  phoneNumberValidator,
}) => {
  const [errors, setErrors] = useState<PhoneNumberErrors[]>([]);

  const { t } = useTranslation();
  const { phoneNumberUpdateSchema, getValidationError } = usePersonSchemata();

  const {
    PHONE_TYPE_VALUES,
    TEST_RESULT_DELIVERY_PREFERENCE_VALUES_SMS,
  } = useTranslatedConstants();

  const phoneNumbersOrDefault = useMemo(
    () =>
      phoneNumbers.length > 0
        ? phoneNumbers
        : [
            {
              type: "",
              number: "",
            },
          ],
    [phoneNumbers]
  );

  const clearError = useCallback(
    (idx: number, field: keyof PhoneNumberErrors) => {
      const newErrors = errors.map((error, i) => {
        if (i !== idx) {
          return error;
        }

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
      try {
        await phoneNumberUpdateSchema.validateAt(
          field,
          phoneNumbersOrDefault[idx]
        );
        clearError(idx, field);
      } catch (e) {
        setErrors((existingErrors) => {
          const newErrors = [...existingErrors];
          newErrors[idx] = {
            ...newErrors[idx],
            [field]: getValidationError(e),
          };

          return newErrors;
        });
      }
    },
    [
      phoneNumbersOrDefault,
      clearError,
      phoneNumberUpdateSchema,
      getValidationError,
    ]
  );

  const validatePhoneNumbers = useCallback(() => {
    phoneNumbers.forEach((pn, idx) => {
      Object.keys(pn).forEach((field) =>
        validateField(idx, field as keyof PhoneNumber)
      );
    });
  }, [phoneNumbers, validateField]);

  useEffect(() => {
    phoneNumberValidator.current = validatePhoneNumbers;
  }, [phoneNumberValidator, validatePhoneNumbers]);

  // Make sure all existing errors are up-to-date (including translations)
  useEffect(() => {
    errors.forEach((phone, idx) => {
      Object.entries(phone || {}).forEach(async ([field, message]) => {
        try {
          await phoneNumberUpdateSchema.validateAt(
            field,
            phoneNumbersOrDefault[idx]
          );
        } catch (e) {
          const error = getValidationError(e);
          if (message && error !== message) {
            setErrors((existingErrors) => {
              const newErrors = [...existingErrors];
              newErrors[idx] = {
                ...newErrors[idx],
                [field]: getValidationError(e),
              };

              return newErrors;
            });
          }
        }
      });
    });
  }, [
    validateField,
    errors,
    phoneNumberUpdateSchema,
    phoneNumbersOrDefault,
    getValidationError,
  ]);

  const onPhoneTypeChange = (index: number, newPhoneType: string) => {
    const newPhoneNumbers = Array.from(phoneNumbersOrDefault);

    newPhoneNumbers[index] = {
      ...newPhoneNumbers[index],
      type: newPhoneType,
    };

    updatePhoneNumbers(newPhoneNumbers);
  };

  const onPhoneNumberChange = (index: number, newPhoneNumber: string) => {
    const newPhoneNumbers = Array.from(phoneNumbersOrDefault);

    newPhoneNumbers[index] = {
      ...newPhoneNumbers[index],
      number: newPhoneNumber,
    };

    updatePhoneNumbers(newPhoneNumbers);
  };

  const onPhoneNumberRemove = (index: number) => {
    const newPhoneNumbers = Array.from(phoneNumbersOrDefault);
    newPhoneNumbers.splice(index, 1);
    updatePhoneNumbers(newPhoneNumbers);
  };

  const onAddPhoneNumber = () => {
    const newPhoneNumbers = Array.from(phoneNumbersOrDefault);
    newPhoneNumbers.push({
      type: "",
      number: "",
    });
    updatePhoneNumbers(newPhoneNumbers);
  };

  const generatePhoneNumberRows = () => {
    return phoneNumbersOrDefault.map((phoneNumber, idx) => {
      const isPrimary = idx === 0;

      return (
        <div key={idx}>
          <div className="display-flex">
            <Input
              className="flex-fill"
              field="number"
              label={
                isPrimary
                  ? t("patient.form.contact.primaryPhoneNumber")
                  : t("patient.form.contact.additionalPhoneNumber")
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
                  aria-label={`Delete phone number ${phoneNumber.number}`.trim()}
                >
                  <FontAwesomeIcon icon={"trash"} className={"text-error"} />
                </button>
              </div>
            )}
          </div>
          <RadioGroup
            name={`phoneType-${idx}`}
            className="margin-top-3"
            legend={t("patient.form.contact.phoneType")}
            buttons={PHONE_TYPE_VALUES}
            selectedRadio={phoneNumber.type}
            required={isPrimary}
            onChange={(e) => onPhoneTypeChange(idx, e)}
            onBlur={() => validateField(idx, "type")}
            validationStatus={validationStatus(idx, "type")}
            errorMessage={t("patient.form.errors.phoneNumbersType")}
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
        label={t("patient.form.contact.addNumber")}
        icon="plus"
      />
      {phoneNumbers.some((pn) => pn.type === "MOBILE") && (
        <RadioGroup
          legend={t("patient.form.testResultDelivery.text")}
          name="testResultDeliveryText"
          buttons={TEST_RESULT_DELIVERY_PREFERENCE_VALUES_SMS}
          onChange={updateTestResultDelivery}
          selectedRadio={(() => {
            // Other fields that may set `testResultDelivery` will not necessarily contain values
            // that are in this radio group, so explicitly set the selected radio to the "NONE"
            // value in this case
            return testResultDelivery === TestResultDeliveryPreferences.SMS
              ? TestResultDeliveryPreferences.SMS
              : TestResultDeliveryPreferences.NONE;
          })()}
        />
      )}
    </div>
  );
};

export default ManagePhoneNumbers;
