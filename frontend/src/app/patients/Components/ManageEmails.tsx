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
    const lastEmailRemoved = index === newEmails.length - 1;
    newEmails.splice(index, 1);
    lastEmailRemoved
      ? document.getElementById("add-email-btn")?.focus()
      : document.getElementsByName(`email-${index}`)?.[0]?.focus();

    updateEmails(newEmails);
  };

  const onAddEmail = () => {
    const newEmails = Array.from(emailsOrDefault);
    newEmails.push("");
    updateEmails(newEmails);
    setTimeout(() => {
      document.getElementsByName(`email-${newEmails.length - 1}`)?.[0]?.focus();
    }, 100);
  };

  return (
    <div className="usa-form">
      {emailsOrDefault.map((email, idx) => (
        <div key={idx}>
          <div
            className={`display-flex ${
              idx === 0 ? "" : "patient-form-deletion-field "
            }`}
          >
            <TextInput
              name={`email-${idx}`}
              idString={`email-${idx}`}
              className="flex-fill emailFormElement"
              value={emailsOrDefault[idx] || ""}
              errorMessage={errors[idx]}
              label={
                idx > 0
                  ? t("patient.form.contact.additionalEmail")
                  : t("patient.form.contact.email")
              }
              onBlur={() => {
                validateField(idx);
              }}
              validationStatus={validationStatus(idx)}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onEmailChange(idx, e.target.value)
              }
            />
            {idx > 0 ? (
              <div className="flex-align-self-end">
                <button
                  className="usa-button--unstyled padding-105 height-5 cursor-pointer"
                  data-testid={`delete-email-${idx}`}
                  onClick={() => onEmailRemove(idx)}
                  aria-label={`Delete additional email ${email.trim()}`}
                >
                  <FontAwesomeIcon icon={"trash"} className={"text-error"} />
                </button>
              </div>
            ) : (
              <></>
            )}
          </div>
        </div>
      ))}
      <Button
        className="margin-top-2"
        onClick={onAddEmail}
        variant="unstyled"
        label={t("patient.form.contact.addEmail")}
        icon="plus"
        id={"add-email-btn"}
      />
    </div>
  );
};

export default ManageEmails;
