import React from "react";
import {
  Control,
  FieldErrors,
  useFieldArray,
  UseFormRegister,
} from "react-hook-form";

import Button from "../../commonComponents/Button/Button";
import Select from "../../commonComponents/Select";
import SeparatorLine from "../Components/SeparatorLine";
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
      <div key={index}>
        <div className="grid-row grid-gap">
          <div className="tablet:grid-col">
            <Select
              label={"Disease"}
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
              label="Test performed"
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
              label="Test ordered"
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
          <div className="tablet:grid-col">
            <TextInput
              name={`supportedDiseases.${index}.equipmentUidType`}
              label="Uid Type"
              disabled={disabled}
              className={"margin-top-1"}
              value={values?.[index]?.equipmentUidType}
              registrationProps={register(
                `supportedDiseases.${index}.equipmentUidType` as const
              )}
            />
          </div>
        </div>
        <div className="grid-row grid-gap">
          <div className="tablet:grid-col">
            <TextInput
              name={`supportedDiseases.${index}.testOrderedLoincLongName`}
              label="Test Ordered Loinc Long Name"
              disabled={disabled}
              className={"margin-top-1"}
              value={values?.[index]?.testOrderedLoincLongName}
              registrationProps={register(
                `supportedDiseases.${index}.testOrderedLoincLongName` as const
              )}
            />
          </div>

          <div className="tablet:grid-col">
            <TextInput
              name={`supportedDiseases.${index}.testPerformedLoincLongName`}
              label="Test Performed Loinc Long Name"
              disabled={disabled}
              className={"margin-top-1"}
              value={values?.[index]?.testPerformedLoincLongName}
              registrationProps={register(
                `supportedDiseases.${index}.testPerformedLoincLongName` as const
              )}
            />
          </div>
        </div>
        <div className="grid-row">
          {index > 0 && (
            <Button
              label={"Delete disease"}
              ariaLabel={`Delete disease`}
              className={"margin-top-1"}
              variant={"secondary"}
              onClick={() => {
                remove(index);
              }}
            />
          )}
        </div>
        <SeparatorLine classNames={"margin-top-2 margin-bottom-2"} />
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
                testOrderedLoincLongName: "",
                testPerformedLoincLongName: "",
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
