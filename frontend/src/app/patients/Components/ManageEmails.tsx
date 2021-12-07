import React, { useCallback, useState, useEffect, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslation } from "react-i18next";

import Button from "../../commonComponents/Button/Button";
import { usePersonSchemata } from "../personSchema";
import TextInput from "../../commonComponents/TextInput";

interface Props {
  emails: string[] | null;
  patient: Nullable<PersonFormData>;
  updateEmails: (emails: string[]) => void;
  emailValidator: React.MutableRefObject<Function | null>;
}

const ManageEmails: React.FC<Props> = ({
  emails,
  updateEmails,
  emailValidator,
}) => {
  const [errors, setErrors] = useState<(string | null)[]>([]);
  const emailsOrDefault = useMemo(
    () => (Array.isArray(emails) && emails.length > 0 ? emails : [""]),
    [emails]
  );

  const { t } = useTranslation();
  const { emailUpdateSchema, getValidationError } = usePersonSchemata();

  const clearError = useCallback(
    (idx: number) => {
      const newErrors = errors.map((error, i) => {
        if (i !== idx) {
          return error;
        }

        return "";
      });

      setErrors(newErrors);
    },
    [errors]
  );

  const validationStatus = (idx: number) => {
    return errors?.[idx] ? "error" : undefined;
  };

  const validateField = useCallback(
    async (idx: number) => {
      try {
        await emailUpdateSchema.validate(emailsOrDefault[idx]);
        clearError(idx);
      } catch (e: any) {
        setErrors((existingErrors) => {
          const newErrors = [...existingErrors];
          newErrors[idx] = getValidationError(e);

          return newErrors;
        });
      }
    },
    [emailsOrDefault, clearError, emailUpdateSchema, getValidationError]
  );

  const validateEmails = useCallback(() => {
    emailsOrDefault.forEach((email, idx) => validateField(idx));
  }, [emailsOrDefault, validateField]);

  useEffect(() => {
    emailValidator.current = validateEmails;
  }, [emailValidator, validateEmails]);

  // Make sure all existing errors are up-to-date (including translations)
  useEffect(() => {
    errors.forEach(async (msg, idx) => {
      try {
        await emailUpdateSchema.validate(emailsOrDefault[idx]);
      } catch (e: any) {
        const error = getValidationError(e);
        if (msg && error !== msg) {
          setErrors((existingErrors) => {
            const newErrors = [...existingErrors];
            newErrors[idx] = error;

            return newErrors;
          });
        }
      }
    });
  }, [
    validateField,
    errors,
    emailUpdateSchema,
    emailsOrDefault,
    getValidationError,
  ]);

  const onEmailChange = (index: number, newEmail = "") => {
    const newEmails = Array.from(emailsOrDefault);

    newEmails[index] = newEmail;

    updateEmails(newEmails);
  };

  const onEmailRemove = (index: number) => {
    const newEmails = Array.from(emailsOrDefault);
    newEmails.splice(index, 1);
    updateEmails(newEmails);
  };

  const onAddEmail = () => {
    const newEmails = Array.from(emailsOrDefault);
    newEmails.push("");
    updateEmails(newEmails);
  };

  return (
    <div className="usa-form">
      {emailsOrDefault.map((email, idx) => (
        <div key={idx}>
          <div className="display-flex">
            <TextInput
              name={`email-${idx}`}
              className="flex-fill"
              value={emailsOrDefault[idx] || ""}
              errorMessage={errors[idx]}
              label={t("patient.form.contact.email")}
              onBlur={() => {
                validateField(idx);
              }}
              validationStatus={validationStatus(idx)}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onEmailChange(idx, e.target.value)
              }
            />
            <div className="flex-align-self-end">
              <button
                className="usa-button--unstyled padding-105 height-5"
                onClick={() => onEmailRemove(idx)}
                aria-label={`Delete email ${email}`.trim()}
              >
                <FontAwesomeIcon icon={"trash"} className={"text-error"} />
              </button>
            </div>
          </div>
        </div>
      ))}
      <Button
        className="margin-top-2"
        onClick={onAddEmail}
        variant="unstyled"
        label={t("patient.form.contact.addEmail")}
        icon="plus"
      />
    </div>
  );
};

export default ManageEmails;
