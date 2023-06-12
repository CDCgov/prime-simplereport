import classnames from "classnames";
import {
  DateInput as TrussworksDateInput,
  DateInputGroup,
} from "@trussworks/react-uswds";
import { useTranslation } from "react-i18next";
import {
  Control,
  Controller,
  FieldErrors,
  UseFormWatch,
} from "react-hook-form";
import moment from "moment/moment";

import { dateFromStrings } from "../utils/date";

import Required from "./Required";

interface Props {
  name: string;
  label: string;
  className?: string;
  labelSrOnly?: boolean;
  labelClassName?: string;
  noHint?: boolean;
  control: Control<DateForm>;
  errors: FieldErrors<DateForm>;
  watch: UseFormWatch<DateForm>;
}
export interface DateForm {
  month: string;
  day: string;
  year: string;
}

export const DateInput = ({
  name,
  label,
  className,
  labelSrOnly,
  labelClassName,
  noHint,
  control,
  errors,
  watch,
}: Props) => {
  const { t } = useTranslation();

  return (
    <fieldset
      className={classnames("usa-form-group usa-fieldset", className, {
        "usa-form-group--error": errors.month ?? errors.day ?? errors.year,
      })}
    >
      <legend
        className={classnames("usa-label", labelClassName, {
          "usa-sr-only": labelSrOnly,
          "usa-label--error": errors.month ?? errors.day ?? errors.year,
        })}
      >
        <Required label={label} />
      </legend>
      {noHint ? null : (
        <span className="usa-hint">{t("testResult.dob.exampleText")}</span>
      )}
      {(errors.month || errors.day || errors.year) && (
        <span
          className="usa-error-message text-pre-line"
          id={`error_${name}`}
          role="alert"
        >
          <span className="usa-sr-only">Error: </span>
          {Array.from(
            new Set([
              errors.month?.message ?? "",
              errors.day?.message ?? "",
              errors.year?.message ?? "",
            ])
          )
            .filter((x) => x !== "")
            .map((error) => t(error))
            .join("\n")}
        </span>
      )}
      <DateInputGroup>
        <Controller
          name={"month"}
          control={control}
          rules={{
            required: "testResult.dob.invalidDate",
            min: { value: 1, message: "testResult.dob.invalidDate" },
            max: { value: 12, message: "testResult.dob.invalidDate" },
          }}
          render={({ field: { value, name, ref, onChange } }) => (
            <TrussworksDateInput
              id={name}
              name={name}
              value={value}
              label={t("constants.date.month")}
              unit={"month"}
              maxLength={2}
              type={"number"}
              inputRef={ref}
              onChange={onChange}
            />
          )}
        />
        <Controller
          name={"day"}
          control={control}
          rules={{
            required: "testResult.dob.invalidDate",
            min: { value: 1, message: "testResult.dob.invalidDate" },
            max: { value: 31, message: "testResult.dob.invalidDate" },
            validate: (day) => {
              const month = watch("month");
              const year = watch("year");
              const date = dateFromStrings(month, day, year);
              if (month && day && year && !date.isValid()) {
                return "testResult.dob.invalidDate";
              }
              return true;
            },
          }}
          render={({ field: { value, name, ref, onChange } }) => (
            <TrussworksDateInput
              id={name}
              name={name}
              value={value}
              label={t("constants.date.day")}
              unit={"day"}
              maxLength={2}
              type={"number"}
              inputRef={ref}
              onChange={onChange}
            />
          )}
        />
        <Controller
          name={"year"}
          control={control}
          rules={{
            required: "testResult.dob.invalidDate",
            maxLength: { value: 4, message: "testResult.dob.invalidDate" },
            minLength: { value: 4, message: "testResult.dob.invalidDate" },
            min: { value: 1900, message: "testResult.dob.invalidYear" },
            max: {
              value: moment().year(),
              message: "testResult.dob.invalidYear",
            },
          }}
          render={({ field: { ref, value, name, onChange } }) => (
            <TrussworksDateInput
              id={name}
              name={name}
              value={value}
              label={t("constants.date.year")}
              unit={"year"}
              maxLength={4}
              type={"number"}
              inputRef={ref}
              onChange={onChange}
            />
          )}
        />
      </DateInputGroup>
    </fieldset>
  );
};
