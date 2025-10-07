import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Control,
  FieldErrors,
  useFieldArray,
  UseFormRegister,
} from "react-hook-form";

import Button from "../../commonComponents/Button/Button";
import Select from "../../commonComponents/Select";
import TextInput from "../../commonComponents/TextInput";

import { DeviceFormData, SupportedDiseasesFormData } from "./DeviceForm";

type DiseaseInformationProps = {
  supportedDiseaseOptions: any;
  disabled: boolean;
  register: UseFormRegister<any>;
  control: Control<DeviceFormData, any>;
  errors: FieldErrors<DeviceFormData>;
  values: SupportedDiseasesFormData[];
};

const DiseaseInformation = ({
  control,
  register,
  errors,
  supportedDiseaseOptions,
  disabled,
  values,
}: DiseaseInformationProps) => {
  /**
   * Form setup
   */
  const { fields, append, remove } = useFieldArray({
    control,
    name: "supportedDiseases",
  });

  /**
   * Add new supported disease
   */
  const createSupportedDiseaseRow = (field: any, index: number) => {
    return (
      <div className="grid-row grid-gap" key={index}>
        <div className="tablet:grid-col">
          <Select
            label={"Supported disease"}
            options={supportedDiseaseOptions}
            disabled={disabled}
            required
            value={values?.[index]?.supportedDisease}
            defaultOption={""}
            defaultSelect={true}
            className={"margin-top-1"}
            validationStatus={
              errors?.supportedDiseases?.[index]?.supportedDisease?.type
                ? "error"
                : undefined
            }
            errorMessage="This is a required field"
            registrationProps={register(
              `supportedDiseases.${index}.supportedDisease` as const,
              {
                required: true,
              }
            )}
          />
        </div>
        <div className="tablet:grid-col">
          <TextInput
            name={`supportedDiseases.${index}.testPerformedLoincCode`}
            label="Test performed code"
            disabled={disabled}
            required
            className={"margin-top-1"}
            value={values?.[index]?.testPerformedLoincCode}
            validationStatus={
              errors?.supportedDiseases?.[index]?.testPerformedLoincCode?.type
                ? "error"
                : undefined
            }
            errorMessage="This is a required field"
            registrationProps={register(
              `supportedDiseases.${index}.testPerformedLoincCode` as const,
              {
                required: true,
              }
            )}
          />
        </div>
        <div className="tablet:grid-col">
          <TextInput
            name={`supportedDiseases.${index}.testOrderedLoincCode`}
            label="Test ordered code"
            disabled={disabled}
            required
            className={"margin-top-1"}
            value={values?.[index]?.testOrderedLoincCode}
            validationStatus={
              errors?.supportedDiseases?.[index]?.testOrderedLoincCode?.type
                ? "error"
                : undefined
            }
            errorMessage="This is a required field"
            registrationProps={register(
              `supportedDiseases.${index}.testOrderedLoincCode` as const,
              {
                required: true,
              }
            )}
          />
        </div>
        <div className="tablet:grid-col">
          <TextInput
            name={`supportedDiseases.${index}.testkitNameId`}
            label="Testkit Name Id"
            disabled={disabled}
            className={"margin-top-1"}
            value={values?.[index]?.testkitNameId}
            registrationProps={register(
              `supportedDiseases.${index}.testkitNameId` as const
            )}
          />
        </div>
        <div className="tablet:grid-col">
          <TextInput
            name={`supportedDiseases.${index}.equipmentUid`}
            label="Equipment Uid"
            disabled={disabled}
            className={"margin-top-1"}
            value={values?.[index]?.equipmentUid}
            registrationProps={register(
              `supportedDiseases.${index}.equipmentUid` as const
            )}
          />
        </div>
        <div className="flex-align-self-end">
          {index > 0 ? (
            <button
              className="usa-button--unstyled padding-105 height-5 cursor-pointer"
              onClick={() => {
                remove(index);
              }}
              aria-label={`Delete disease`}
            >
              <FontAwesomeIcon icon={"trash"} className={"text-error"} />
            </button>
          ) : (
            <div className={"padding-205 height-5"}></div>
          )}
        </div>
      </div>
    );
  };

  /**
   * HTML
   */
  return (
    <>
      <fieldset className={"usa-fieldset margin-top-205"}>
        <legend>Disease Information</legend>
        {fields.map(createSupportedDiseaseRow)}
      </fieldset>
      <div className="grid-row grid-gap">
        <div className="tablet:grid-col" style={{ marginBottom: "56px" }}>
          <Button
            className="margin-top-2"
            onClick={() => {
              append({
                supportedDisease: "",
                testPerformedLoincCode: "",
                equipmentUid: "",
                testkitNameId: "",
                testOrderedLoincCode: "",
              });
            }}
            variant="unstyled"
            label={"Add another disease"}
            icon="plus"
            disabled={disabled}
          />
        </div>
      </div>
    </>
  );
};

export default DiseaseInformation;
